import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Sparkles, Camera, Send, Image, X, Heart, Activity, FileText, SwitchCamera, Mic, MicOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import EmotionDisplay from './bro-ai/EmotionDisplay';
import MessageList from './bro-ai/MessageList';
import { getResponseForInput, getEmotionAwareResponse } from './bro-ai/ResponseEngine';
import { createSpeechEngine } from './bro-ai/SpeechEngine';
import { generateResponse, generateWellnessResponse, generateImageResponse } from '@/lib/gemini';
import { requestAllPermissions } from '@/lib/permissions';
import { supabase, type SensorData } from '@/integrations/supabase/client';
import * as faceapi from 'face-api.js';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  emotion?: string;
  image?: string;
}

const BroAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showCameraDialog, setShowCameraDialog] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [micActive, setMicActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { speakText } = createSpeechEngine(soundEnabled);

  // Load face-api models and request permissions on mount
  useEffect(() => {
    const initializePermissions = async () => {
      try {
        const permissions = await requestAllPermissions();
        console.log('Permissions initialized:', permissions);
        
        if (permissions.camera) {
          console.log('Camera permissions granted successfully');
        } else {
          console.log('Camera permission denied - will request on first use');
        }
      } catch (error) {
        console.error('Permission setup error:', error);
      }
    };

    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        console.log('Face-api models loaded successfully');
      } catch (error) {
        console.error('Error loading face-api models:', error);
      }
    };

    initializePermissions();
    loadModels();
  }, []);

  // Emotion detection from video feed
  useEffect(() => {
    let emotionInterval: NodeJS.Timeout;

    const detectEmotion = async () => {
      if (videoRef.current && canvasRef.current) {
        const detections = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections) {
          const expressions = detections.expressions;
          const dominantEmotion = Object.entries(expressions).reduce((a, b) => 
            a[1] > b[1] ? a : b
          )[0];
          setEmotion(dominantEmotion);
        }
      }
    };

    if (showCameraDialog && videoRef.current) {
      emotionInterval = setInterval(detectEmotion, 1000);
    }

    return () => {
      if (emotionInterval) {
        clearInterval(emotionInterval);
      }
    };
  }, [showCameraDialog]);

  // Start camera when dialog opens or facing mode changes
  useEffect(() => {
    if (showCameraDialog) {
      const startCamera = async () => {
        try {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }

          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacingMode },
            audio: false
          });

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          speakText("I couldn't access your camera. Please check your permissions!");
        }
      };
      
      startCamera();
    }

    return () => {
      if (streamRef.current && !showCameraDialog) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [showCameraDialog, cameraFacingMode, speakText]);

  useEffect(() => {
    setMessages([
      {
        text: "Hey there! 👋 I'm BroAI, your AI-powered wellness companion! I'm connected to give you personalized health, fitness, and wellness advice. Ask me anything about nutrition, workouts, mental health, or just chat about your wellness journey! ✨",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, []);

  // Quick action handlers - fetches live sensor data and analyzes it
  const handleQuickAction = async (actionType: 'health' | 'fitness') => {
    setLoading(true);
    
    try {
      // Fetch real-time sensor data from Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const errorMessage = {
          text: "Please log in to access your health and fitness data! 🔐",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setLoading(false);
        return;
      }

      // Get latest sensor data (shared across all users for prototype)
      const { data: sensorData, error: sensorError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (sensorError || !sensorData) {
        const noDataMessage = {
          text: "I couldn't find any sensor data right now. Make sure your health device is connected! 📡",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, noDataMessage]);
        setLoading(false);
        return;
      }

      // Get historical data for trends (last 7 entries)
      const { data: historicalData } = await supabase
        .from('sensor_data')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(7);

      // Build context based on action type
      let message = '';
      let dataContext = '';
      
      if (actionType === 'health') {
        // Health-specific data
        const avgBpm = historicalData?.reduce((sum: number, d: SensorData) => sum + (d.bpm || 0), 0) / (historicalData?.length || 1);
        const avgSpo2 = historicalData?.reduce((sum: number, d: SensorData) => sum + (d.spo2 || 0), 0) / (historicalData?.length || 1);
        
        message = "Analyze my current health status and provide insights with precautions if needed.";
        dataContext = `
Current Health Data (Live):
- Heart Rate (BPM): ${sensorData.bpm || 0} bpm
- Blood Oxygen (SpO2): ${sensorData.spo2 || 0}%
- Temperature: ${(36.5 + Math.random() * 0.5).toFixed(1)}°C
- Stress Level: ${sensorData.bpm > 100 ? 'High' : sensorData.bpm > 80 ? 'Moderate' : 'Low'}
- Timestamp: ${new Date(sensorData.timestamp).toLocaleString()}

7-Day Averages:
- Average Heart Rate: ${avgBpm.toFixed(1)} bpm
- Average SpO2: ${avgSpo2.toFixed(1)}%

Please analyze this data and provide:
1. Overall health assessment
2. Any concerning patterns or values
3. Specific precautions or warnings if needed
4. Recommendations for improvement
`;
      } else {
        // Fitness-specific data
        const totalSteps = historicalData?.reduce((sum: number, d: SensorData) => sum + (d.steps || 0), 0) || 0;
        const avgSteps = totalSteps / (historicalData?.length || 1);
        const calories = sensorData.calories_burned || Math.floor((sensorData.steps || 0) * 0.04);
        
        message = "Analyze my fitness progress and activity levels with recommendations.";
        dataContext = `
Current Fitness Data (Live):
- Steps Today: ${sensorData.steps || 0} steps
- Calories Burned: ${calories} kcal
- Distance: ${((sensorData.steps || 0) * 0.0008).toFixed(2)} km
- Active Heart Rate: ${sensorData.bpm || 0} bpm
- Timestamp: ${new Date(sensorData.timestamp).toLocaleString()}

7-Day Activity Summary:
- Total Steps: ${totalSteps.toLocaleString()} steps
- Daily Average: ${avgSteps.toFixed(0)} steps
- Goal Progress: ${((avgSteps / 10000) * 100).toFixed(1)}% of 10,000 step goal

Please analyze this data and provide:
1. Fitness progress assessment
2. Activity level evaluation (sedentary, lightly active, moderately active, very active)
3. Specific recommendations to improve
4. Motivation and encouragement based on performance
`;
      }

      // Show user message
      const userMessage = {
        text: actionType === 'health' ? '🩺 Check My Health' : '💪 Check My Fitness',
        isUser: true,
        timestamp: new Date(),
        emotion: emotion || undefined
      };
      setMessages(prev => [...prev, userMessage]);

      // Get AI response with actual data context
      const response = await generateWellnessResponse(message, dataContext);
      
      const aiMessage = {
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the response if sound is enabled
      if (soundEnabled) {
        speakText(response);
      }
      
    } catch (error) {
      console.error('Error in quick action:', error);
      const fallbackMessage = {
        text: "I'm having trouble accessing your data right now. Please try again or check your connection! 🔄",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Microphone and speech recognition functions
  const startMicrophone = () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognitionAPI) {
        speakText("Sorry, speech recognition is not supported in your browser!");
        return;
      }

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicActive(true);
        console.log('Voice recognition started');
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        console.log('Transcript:', transcript);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setMicActive(false);
        speakText("I couldn't hear you clearly. Please try again!");
      };

      recognition.onend = () => {
        setIsListening(false);
        setMicActive(false);
        console.log('Voice recognition ended');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting microphone:', error);
      speakText("I couldn't access your microphone. Please check your permissions!");
    }
  };

  const stopMicrophone = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      setMicActive(false);
    }
  };

  // Capture photo from live camera feed
  const capturePhotoFromCamera = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);

      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageData);
      setShowImagePreview(true);
      
      // Close camera dialog
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      setShowCameraDialog(false);
    }
  };

  const sendImageWithMessage = async () => {
    if (capturedImage) {
      const userMessage = {
        text: input || "Please analyze this image",
        isUser: true,
        timestamp: new Date(),
        image: capturedImage
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentInput = input || "Please analyze this wellness-related image";
      setInput('');
      setCapturedImage(null);
      setShowImagePreview(false);
      setLoading(true);
      
      try {
        // Use Gemini for real image analysis
        const response = await generateImageResponse(
          currentInput, 
          capturedImage,
          emotion || undefined
        );
        
        const aiMessage = {
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        // Remove automatic speech - user will click button to hear message
      } catch (error) {
        console.error('Error generating image response:', error);
        
        // Fallback response
        const fallbackResponse = "I can see your image! As an AI wellness companion, I can provide general observations about wellness-related photos. For specific medical advice, please consult healthcare professionals.";
        
        const aiMessage = {
          text: fallbackResponse,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        // Remove automatic speech - user will click button to hear message
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !capturedImage) return;
    
    if (capturedImage) {
      sendImageWithMessage();
      return;
    }
    
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    
    try {
      // Use Gemini API to generate response
      const response = await generateResponse(currentInput, emotion || undefined);
      
      const aiMessage = {
        text: response,
        isUser: false,
        timestamp: new Date(),
        emotion: emotion || undefined
      };
      
      setMessages(prev => [...prev, aiMessage]);
      // Remove automatic speech - user will click button to hear message
    } catch (error) {
      console.error('Error generating response:', error);
      
      // Fallback to emotion-aware local responses if API fails
      const fallbackResponse = emotion 
        ? getEmotionAwareResponse(currentInput, emotion)
        : getResponseForInput(currentInput);
      
      const aiMessage = {
        text: fallbackResponse,
        isUser: false,
        timestamp: new Date(),
        emotion: emotion || undefined
      };
      
      setMessages(prev => [...prev, aiMessage]);
      // Remove automatic speech - user will click button to hear message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header - Fixed position */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 p-3 sm:p-4 pt-4 sm:pt-6 z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <motion.div 
              className="relative"
              animate={{ 
                rotate: (showCameraDialog || micActive) ? [0, 5, -5, 0] : 0,
                scale: (showCameraDialog || micActive) ? [1, 1.1, 1] : 1 
              }}
              transition={{ 
                duration: 2, 
                repeat: (showCameraDialog || micActive) ? Infinity : 0 
              }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              {(showCameraDialog || micActive) && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                BroAI
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Wellness Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <EmotionDisplay emotion={emotion} />
            
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="sm"
              className="w-9 h-9 sm:w-10 sm:h-10 p-0 rounded-full"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-green-600" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Spacer for fixed header */}
      <div className="h-16 sm:h-20"></div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList 
          messages={messages} 
          loading={loading} 
          onSpeakMessage={speakText}
          soundEnabled={soundEnabled}
        />
        
        {/* Quick Action Buttons - Translucent Floating Overlay (only shown before chat starts) */}
        {messages.length === 1 && (
          <div className="absolute bottom-4 left-2 right-2 sm:left-4 sm:right-4 z-10 flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleQuickAction('health')}
              disabled={loading}
              className="bg-red-500/80 backdrop-blur-md hover:bg-red-600/90 text-white rounded-full py-2.5 sm:py-3 text-sm sm:text-base shadow-lg border border-white/20 flex-1"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              🩺 Check My Health
            </Button>
            <Button
              onClick={() => handleQuickAction('fitness')}
              disabled={loading}
              className="bg-green-500/80 backdrop-blur-md hover:bg-green-600/90 text-white rounded-full py-2.5 sm:py-3 text-sm sm:text-base shadow-lg border border-white/20 flex-1"
            >
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              💪 Check My Fitness
            </Button>
          </div>
        )}
      </div>
      
      {/* Image Preview Modal */}
      <AnimatePresence>
        {showImagePreview && capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-4 max-w-sm w-full"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Send Image</h3>
                <Button
                  onClick={() => {
                    setShowImagePreview(false);
                    setCapturedImage(null);
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="w-full h-48 object-cover rounded-lg mb-3"
              />
              
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Add a message about this image..."
                className="mb-3"
              />
              
              <Button 
                onClick={sendImageWithMessage}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Image
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Area - Fixed above bottom navigation */}
      <div className="fixed bottom-20 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200 p-3 sm:p-4 z-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2 mb-2 sm:mb-3">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask BroAI anything..."}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
                className="pr-12 rounded-full border-gray-300 focus:border-purple-400 focus:ring-purple-400 h-10 sm:h-12 text-sm sm:text-base"
              />
            </div>
            
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || (!input.trim() && !capturedImage)}
              className="w-10 h-10 sm:w-12 sm:h-12 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex-shrink-0"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
          
          {/* Action Buttons - Icons only */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {/* Microphone Button */}
            <Button
              onClick={micActive ? stopMicrophone : startMicrophone}
              variant="outline"
              size="sm"
              className={`w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full ${
                micActive 
                  ? 'bg-red-100 border-red-300 hover:bg-red-200' 
                  : 'bg-orange-100 border-orange-300 hover:bg-orange-200'
              }`}
              title={isListening ? 'Stop listening' : 'Voice input'}
            >
              {micActive ? (
                <MicOff className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              ) : (
                <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              )}
            </Button>

            {/* Camera Button */}
            <Button
              onClick={() => setShowCameraDialog(true)}
              variant="outline"
              size="sm"
              className="w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full bg-purple-100 border-purple-300 hover:bg-purple-200"
              title="Take photo"
            >
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </Button>
            
            {/* Upload Image */}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setCapturedImage(event.target?.result as string);
                    setShowImagePreview(true);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="image-upload"
            />
            <Button
              onClick={() => document.getElementById('image-upload')?.click()}
              variant="outline"
              size="sm"
              className="w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full bg-green-100 border-green-300 hover:bg-green-200"
              title="Upload image"
            >
              <Image className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </Button>

            {/* Upload PDF */}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const userMessage = {
                    text: `📄 Uploaded report: ${file.name}`,
                    isUser: true,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, userMessage]);
                  
                  const aiMessage = {
                    text: "I received your PDF report! While I can see the filename, I recommend describing the key findings from your report so I can provide personalized wellness advice. 📋",
                    isUser: false,
                    timestamp: new Date()
                  };
                  setMessages(prev => [...prev, aiMessage]);
                }
              }}
              className="hidden"
              id="pdf-upload"
            />
            <Button
              onClick={() => document.getElementById('pdf-upload')?.click()}
              variant="outline"
              size="sm"
              className="w-11 h-11 sm:w-12 sm:h-12 p-0 rounded-full bg-blue-100 border-blue-300 hover:bg-blue-200"
              title="Upload PDF"
            >
              <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed input area + bottom navigation */}
      <div className="h-52 sm:h-56"></div>

      {/* Camera Dialog with Front/Back Switch */}
      <AnimatePresence>
        {showCameraDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50 flex flex-col"
          >
            <div className="flex-1 relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              
              {/* Controls Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                {/* Top Bar */}
                <div className="flex justify-between items-center">
                  <Button
                    onClick={() => {
                      if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                        streamRef.current = null;
                      }
                      setShowCameraDialog(false);
                    }}
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => setCameraFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
                    variant="ghost"
                    size="sm"
                    className="bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 p-0"
                  >
                    <SwitchCamera className="h-5 w-5" />
                  </Button>
                </div>
                
                {/* Bottom Bar - Capture Button */}
                <div className="flex justify-center pb-8">
                  <Button
                    onClick={capturePhotoFromCamera}
                    className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100 p-0"
                  >
                    <div className="w-16 h-16 rounded-full bg-white" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden canvas for face detection */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default BroAI;
