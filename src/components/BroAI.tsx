
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, Heart, Sparkles } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useSubscription } from '@/contexts/SubscriptionContext';

const BroAI = () => {
  const [messages, setMessages] = useState<{text: string; isUser: boolean; timestamp: Date; emotion?: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recognitionRef = useRef<any>(null);
  const { isSubscribed, checkFeatureAccess } = useSubscription();

  const hasAccess = checkFeatureAccess('ai-assistant');

  useEffect(() => {
    // Add initial greeting message with a friendly tone
    setMessages([
      {
        text: "Hey buddy! 👋 I'm BroAI, your personal wellness companion! I'm here to help you crush your health and fitness goals. What's on your mind today?",
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
        setIsModelLoaded(true);
        console.log("Face models loaded successfully");
      } catch (error) {
        console.error("Error loading face models:", error);
      }
    };
    
    loadModels();
  }, []);

  const startCamera = async () => {
    if (!isModelLoaded) {
      speakText("Hey, I'm still loading my face detection models. Give me a moment!");
      return;
    }
    
    if (!hasAccess) {
      speakText("You'll need a premium subscription to use my camera features!");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        speakText("Camera activated! I can now see your expressions!");
        
        videoRef.current.addEventListener('play', () => {
          const canvas = canvasRef.current;
          const displaySize = { 
            width: videoRef.current?.videoWidth || 640, 
            height: videoRef.current?.videoHeight || 480 
          };

          if (canvas) {
            faceapi.matchDimensions(canvas, displaySize);
          }
          
          setInterval(async () => {
            if (videoRef.current && cameraActive) {
              const detections = await faceapi.detectAllFaces(
                videoRef.current, 
                new faceapi.TinyFaceDetectorOptions()
              ).withFaceLandmarks().withFaceExpressions();
              
              if (detections && detections[0]?.expressions) {
                const expressions = detections[0].expressions;
                const maxExpression = Object.entries(expressions)
                  .reduce((prev, current) => {
                    return (prev[1] > current[1]) ? prev : current;
                  });
                
                if (maxExpression[1] > 0.6) {
                  const newEmotion = maxExpression[0];
                  if (newEmotion !== emotion) {
                    setEmotion(newEmotion);
                    handleEmotionChange(newEmotion);
                  }
                }
              }
              
              if (canvas && detections.length > 0) {
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
                faceapi.draw.drawDetections(canvas, resizedDetections);
                faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
              }
            }
          }, 500);
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      speakText("Oops! I couldn't access your camera. Make sure you've given permission!");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      
      if (canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      
      setCameraActive(false);
      setEmotion(null);
      speakText("Camera turned off. I'm still here if you need me!");
    }
  };

  const startMicrophone = async () => {
    if (!hasAccess) {
      speakText("You'll need a premium subscription to use voice features!");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onstart = () => {
          setMicActive(true);
          setIsListening(true);
          speakText("I'm listening! Go ahead and speak.");
        };
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
          
          if (finalTranscript) {
            setInput(finalTranscript);
            setIsListening(false);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setMicActive(false);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setMicActive(false);
          setIsListening(false);
        };
        
        recognitionRef.current.start();
      } else {
        speakText("Sorry, your browser doesn't support speech recognition!");
      }
    } catch (err) {
      console.error("Error accessing microphone:", err);
      speakText("I couldn't access your microphone. Please check your permissions!");
    }
  };

  const stopMicrophone = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setMicActive(false);
      setIsListening(false);
      speakText("Stopped listening.");
    }
  };

  const speakText = (text: string) => {
    if (!soundEnabled) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to use a more natural voice
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Microsoft') || voice.default
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    speechSynthesis.speak(utterance);
  };

  const handleEmotionChange = (newEmotion: string) => {
    let emotionResponse = "";
    
    switch(newEmotion) {
      case 'happy':
        emotionResponse = "I love seeing that smile! You're radiating positive energy! 😊";
        break;
      case 'sad':
        emotionResponse = "Hey, I notice you seem a bit down. Remember, I'm here for you. Want to talk about it? 🤗";
        break;
      case 'angry':
        emotionResponse = "You look a bit frustrated, buddy. Let's take a deep breath together and work through this. 😌";
        break;
      case 'surprised':
        emotionResponse = "Whoa! You look surprised! Did I say something amazing? 😲";
        break;
      case 'fearful':
        emotionResponse = "You seem worried. Don't worry, I'm here to help you feel better! 💪";
        break;
      case 'disgusted':
        emotionResponse = "Not feeling great about something? Let's find a way to turn that around! 🌟";
        break;
      default:
        emotionResponse = "I can see your expression - thanks for letting me read your mood! 👁️";
    }
    
    const emotionMessage = {
      text: emotionResponse,
      isUser: false,
      timestamp: new Date(),
      emotion: newEmotion
    };
    
    setMessages(prev => [...prev, emotionMessage]);
    speakText(emotionResponse);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    setTimeout(() => {
      let response = getResponseForInput(input);
      
      // Emotion-aware responses
      if (emotion) {
        response = getEmotionAwareResponse(input, emotion);
      }
      
      const aiMessage = {
        text: response,
        isUser: false,
        timestamp: new Date(),
        emotion: emotion || undefined
      };
      
      setMessages(prev => [...prev, aiMessage]);
      speakText(response);
      setLoading(false);
    }, 1000);
  };

  const getEmotionAwareResponse = (input: string, currentEmotion: string) => {
    const baseResponse = getResponseForInput(input);
    
    switch(currentEmotion) {
      case 'happy':
        return `Your positive energy is contagious! 😄 ${baseResponse} Keep that smile going!`;
      case 'sad':
        return `I can see you're feeling down, but I'm here for you. ${baseResponse} Remember, every small step counts! 🌈`;
      case 'angry':
        return `I sense some frustration. Let's channel that energy positively! ${baseResponse} Take a deep breath with me! 🧘‍♂️`;
      case 'surprised':
        return `You look amazed! ${baseResponse} I love seeing that curiosity! ✨`;
      default:
        return baseResponse;
    }
  };

  const getResponseForInput = (input: string) => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('workout') || lowercaseInput.includes('exercise')) {
      return "Let's get you moving, champ! 💪 I recommend starting with a balanced routine: 30 minutes of cardio 3x weekly plus 2 strength training sessions. Want me to create a personalized plan for you?";
    }
    
    if (lowercaseInput.includes('diet') || lowercaseInput.includes('nutrition') || lowercaseInput.includes('food')) {
      return "Nutrition is your superpower! 🥗 Focus on colorful whole foods, lean proteins, and plenty of water. Think of it as fueling your awesome body! Need some tasty meal ideas?";
    }
    
    if (lowercaseInput.includes('sleep') || lowercaseInput.includes('tired')) {
      return "Sleep is when the magic happens! 😴 Aim for 7-9 hours in a cool, dark room. Your body repairs and grows stronger while you dream. Want some bedtime routine tips?";
    }
    
    if (lowercaseInput.includes('stress') || lowercaseInput.includes('anxious')) {
      return "Stress happens to the best of us! 🌱 Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8. You've got this, and I believe in you!";
    }
    
    if (lowercaseInput.includes('motivation') || lowercaseInput.includes('lazy')) {
      return "Everyone has those days! 🚀 Remember why you started this journey. Start small - even 5 minutes counts! Progress, not perfection, is the goal!";
    }
    
    return "That's a fantastic question! 🌟 As your wellness buddy, I'm here to help you thrive! Whether it's fitness, nutrition, or mindset - we'll tackle it together! What aspect interests you most?";
  };

  const getEmotionIcon = () => {
    if (!emotion) return <Heart className="h-5 w-5 text-pink-500" />;
    
    const emotionMap: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😤',
      'surprised': '😲',
      'fearful': '😰',
      'disgusted': '😒',
      'neutral': '😐'
    };
    
    return <span className="text-lg">{emotionMap[emotion] || '🤖'}</span>;
  };

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-0">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-6 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
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
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <Sparkles className="h-8 w-8 text-white" />
                  </div>
                  {(cameraActive || micActive) && (
                    <motion.div 
                      className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <span className="text-xs">🟢</span>
                    </motion.div>
                  )}
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    BroAI
                  </h1>
                  <p className="text-gray-600 font-medium">Your friendly wellness companion</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {emotion && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md border"
                  >
                    {getEmotionIcon()}
                    <span className="ml-2 text-sm font-medium capitalize text-gray-700">{emotion}</span>
                  </motion.div>
                )}
                
                <Button
                  onClick={soundEnabled ? () => setSoundEnabled(false) : () => setSoundEnabled(true)}
                  variant="outline"
                  size="sm"
                  className={`${soundEnabled ? 'bg-green-100 border-green-300' : 'bg-gray-100'} hover:scale-105 transition-transform`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-green-600" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
                </Button>
                
                <Button
                  onClick={micActive ? stopMicrophone : startMicrophone}
                  disabled={!hasAccess}
                  variant="outline"
                  size="sm"
                  className={`${micActive ? 'bg-red-100 border-red-300' : 'bg-blue-100 border-blue-300'} hover:scale-105 transition-transform`}
                >
                  {micActive ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4 text-blue-600" />}
                </Button>
                
                <Button
                  onClick={cameraActive ? stopCamera : startCamera}
                  disabled={!isModelLoaded || !hasAccess}
                  variant="outline"
                  size="sm"
                  className={`${cameraActive ? 'bg-red-100 border-red-300' : 'bg-purple-100 border-purple-300'} hover:scale-105 transition-transform`}
                >
                  {cameraActive ? <CameraOff className="h-4 w-4 text-red-600" /> : <Camera className="h-4 w-4 text-purple-600" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {cameraActive && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mx-6 mb-4 relative"
            >
              <Card className="overflow-hidden bg-black/90 backdrop-blur-sm shadow-xl">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto rounded-lg"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                  />
                  {isListening && (
                    <motion.div 
                      className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      🎤 Listening...
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-4"
          >
            <Card className="p-4 border-dashed border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="text-center py-3">
                <p className="text-purple-800 font-medium mb-2">🚀 Premium Feature</p>
                <p className="text-purple-600 text-sm mb-3">
                  Unlock voice chat, emotion detection, and advanced AI features
                </p>
                <Button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  size="sm"
                >
                  Upgrade Now ✨
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(index * 0.1, 0.5) }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-none'
                      : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!message.isUser && (
                      <span className="text-lg mt-0.5">🤖</span>
                    )}
                    <div className="flex-1">
                      <p className="leading-relaxed">{message.text}</p>
                      <p className={`text-xs ${message.isUser ? 'text-white/70' : 'text-gray-500'} mt-2 flex items-center justify-between`}>
                        <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {message.emotion && !message.isUser && (
                          <span className="ml-2 opacity-70">Detected: {message.emotion}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md border border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex space-x-1">
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-purple-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-blue-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-pink-400"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask BroAI anything about wellness, fitness, or health..."}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || !hasAccess || isListening}
              className="border-gray-300 focus:border-purple-400 focus:ring-purple-400 bg-white/90 backdrop-blur-sm rounded-xl"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim() || !hasAccess || isListening}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl px-6 hover:scale-105 transition-transform"
            >
              <Send className="h-5 w-5" />
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
    </div>
  );
};

export default BroAI;
