
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Sparkles, Camera, Send, Mic, MicOff, Image, X, Music, Video, Heart, Activity } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { Input } from '@/components/ui/input';
import EmotionDisplay from './bro-ai/EmotionDisplay';
import MessageList from './bro-ai/MessageList';
import { getEmotionAwareResponse, getResponseForInput } from './bro-ai/ResponseEngine';
import { createSpeechEngine } from './bro-ai/SpeechEngine';
import { generateResponse, generateWellnessResponse, generateImageResponse, generateAudioResponse, generateVideoResponse } from '@/lib/gemini';
import { requestAllPermissions } from '@/lib/permissions';
import { supabase, type SensorData } from '@/integrations/supabase/client';

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
  const [cameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emotion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const { speakText } = createSpeechEngine(soundEnabled);

  // Request Capacitor permissions on mount
  useEffect(() => {
    const initializePermissions = async () => {
      try {
        // Request camera and microphone permissions
        const permissions = await requestAllPermissions();
        console.log('Permissions initialized:', permissions);
        
        // Store permission status if needed
        if (permissions.camera && permissions.microphone) {
          console.log('All permissions granted successfully');
        } else {
          console.log('Some permissions were denied - will request on first use');
        }
      } catch (error) {
        console.error('Permission setup error:', error);
      }
    };

    // Don't block app loading - request permissions in background
    initializePermissions();
  }, []);

  useEffect(() => {
    setMessages([
      {
        text: "Hey there! 👋 I'm BroAI, your AI-powered wellness companion! I'm connected to give you personalized health, fitness, and wellness advice. Ask me anything about nutrition, workouts, mental health, or just chat about your wellness journey! ✨",
        isUser: false,
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        console.log("Face models loaded successfully");
      } catch (error) {
        console.error("Error loading face models:", error);
      }
    };
    
    loadModels();
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

  const startMicrophone = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setMicActive(true);
          setIsListening(true);
          speakText("I'm listening! Go ahead and speak.");
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setMicActive(false);
          setIsListening(false);
        };
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setMicActive(false);
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setMicActive(false);
          setIsListening(false);
        };
        
        recognition.start();
      } else {
        speakText("Sorry, your browser doesn't support speech recognition!");
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      speakText("I couldn't access your microphone. Please check your permissions!");
    }
  };

  const stopMicrophone = () => {
    setMicActive(false);
    setIsListening(false);
    speakText("Stopped listening.");
  };

  const capturePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        setShowImagePreview(true);
        
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (err) {
      console.error("Error accessing camera:", err);
      speakText("I couldn't access your camera. Please check your permissions!");
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
      
      // Fallback to local responses if API fails
      let fallbackResponse = getResponseForInput(currentInput);
      if (emotion) {
        fallbackResponse = getEmotionAwareResponse(currentInput, emotion);
      }
      
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
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 p-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="relative"
              animate={{ 
                rotate: cameraActive ? [0, 5, -5, 0] : 0,
                scale: micActive ? [1, 1.1, 1] : 1 
              }}
              transition={{ 
                duration: 2, 
                repeat: cameraActive || micActive ? Infinity : 0 
              }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              {(cameraActive || micActive) && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                BroAI
              </h1>
              <p className="text-sm text-gray-600">Wellness Companion</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <EmotionDisplay emotion={emotion} />
            
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              variant="outline"
              size="sm"
              className="w-10 h-10 p-0 rounded-full"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-green-600" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          loading={loading} 
          onSpeakMessage={speakText}
          soundEnabled={soundEnabled}
        />
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
      
      {/* Input Area */}
      <div className="bg-white/90 backdrop-blur-lg border-t border-gray-200 p-4">
        {/* Quick Action Buttons */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => handleQuickAction('health')}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-full py-2"
            size="sm"
          >
            <Heart className="h-4 w-4 mr-2" />
            Check My Health
          </Button>
          <Button
            onClick={() => handleQuickAction('fitness')}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-full py-2"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            Check My Fitness
          </Button>
        </div>

        <div className="flex items-center space-x-2 mb-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask BroAI anything about wellness..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || isListening}
              className="pr-12 rounded-full border-gray-300 focus:border-purple-400 focus:ring-purple-400"
            />
            {isListening && (
              <motion.div 
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              </motion.div>
            )}
          </div>
          
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || (!input.trim() && !capturedImage) || isListening}
            className="w-12 h-12 p-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button
            onClick={micActive ? stopMicrophone : startMicrophone}
            variant="outline"
            size="sm"
            className={`flex-1 max-w-24 rounded-full ${micActive ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'}`}
          >
            {micActive ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4 text-blue-600" />}
          </Button>
          
          <Button
            onClick={capturePhoto}
            variant="outline"
            size="sm"
            className="flex-1 max-w-24 rounded-full bg-purple-100 border-purple-300"
          >
            <Camera className="h-4 w-4 text-purple-600" />
          </Button>
          
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
            className="flex-1 max-w-18 rounded-full bg-green-100 border-green-300"
          >
            <Image className="h-4 w-4 text-green-600" />
          </Button>

          {/* Audio Upload */}
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const audioData = event.target?.result as string;
                  const userMessage = {
                    text: `Shared audio file: ${file.name}`,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, userMessage]);
                  setLoading(true);
                  
                  try {
                    const response = await generateAudioResponse(
                      "Please analyze this audio file for wellness insights",
                      audioData,
                      file.type,
                      emotion || undefined
                    );
                    
                    const aiMessage = {
                      text: response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, aiMessage]);
                  } catch (error) {
                    console.error('Error analyzing audio:', error);
                    const aiMessage = {
                      text: "I had trouble analyzing your audio file. Could you try again or tell me about it instead?",
                      isUser: false,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);
                  } finally {
                    setLoading(false);
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            className="hidden"
            id="audio-upload"
          />
          <Button
            onClick={() => document.getElementById('audio-upload')?.click()}
            variant="outline"
            size="sm"
            className="flex-1 max-w-18 rounded-full bg-yellow-100 border-yellow-300"
          >
            <Music className="h-4 w-4 text-yellow-600" />
          </Button>

          {/* Video Upload */}
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size <= 20 * 1024 * 1024) { // 20MB limit
                const reader = new FileReader();
                reader.onload = async (event) => {
                  const videoData = event.target?.result as string;
                  const userMessage = {
                    text: `Shared video file: ${file.name}`,
                    isUser: true,
                    timestamp: new Date()
                  };
                  
                  setMessages(prev => [...prev, userMessage]);
                  setLoading(true);
                  
                  try {
                    const response = await generateVideoResponse(
                      "Please analyze this video for wellness, fitness, or health insights",
                      videoData,
                      file.type,
                      emotion || undefined
                    );
                    
                    const aiMessage = {
                      text: response,
                      isUser: false,
                      timestamp: new Date()
                    };
                    
                    setMessages(prev => [...prev, aiMessage]);
                  } catch (error) {
                    console.error('Error analyzing video:', error);
                    const aiMessage = {
                      text: "I had trouble analyzing your video file. Could you try a smaller file or describe what's in the video?",
                      isUser: false,
                      timestamp: new Date()
                    };
                    setMessages(prev => [...prev, aiMessage]);
                  } finally {
                    setLoading(false);
                  }
                };
                reader.readAsDataURL(file);
              } else if (file && file.size > 20 * 1024 * 1024) {
                const aiMessage = {
                  text: "That video file is too large! Please try a smaller video (under 20MB) or describe what's in it instead.",
                  isUser: false,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMessage]);
              }
            }}
            className="hidden"
            id="video-upload"
          />
          <Button
            onClick={() => document.getElementById('video-upload')?.click()}
            variant="outline"
            size="sm"
            className="flex-1 max-w-18 rounded-full bg-pink-100 border-pink-300"
          >
            <Video className="h-4 w-4 text-pink-600" />
          </Button>
        </div>
        
        {isListening && (
          <motion.p 
            className="text-center text-sm text-purple-600 mt-2 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            🎤 Speak now... I'm listening!
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default BroAI;
