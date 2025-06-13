import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, SmilePlus, Frown, Smile, Meh, Video, VideoOff, Sparkles, Brain, Zap } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useSubscription } from '@/contexts/SubscriptionContext';

const BroAI = () => {
  const [messages, setMessages] = useState<{text: string; isUser: boolean; timestamp: Date}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isSubscribed, checkFeatureAccess } = useSubscription();

  const hasAccess = checkFeatureAccess('ai-assistant');

  useEffect(() => {
    // Add initial greeting message with animation
    setMessages([
      {
        text: "🚀 Hey there, champion! I'm your BroAI - your ultimate health and wellness wingman! Ready to crush those fitness goals together? 💪",
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
        console.log("Face models loaded");
      } catch (error) {
        console.error("Error loading face models:", error);
      }
    };
    
    loadModels();
  }, []);

  const startCamera = async () => {
    if (!isModelLoaded) {
      alert("Face detection models are still loading. Please wait...");
      return;
    }
    
    if (!hasAccess) {
      alert("This feature requires a premium subscription");
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        
        videoRef.current.addEventListener('play', () => {
          const canvas = canvasRef.current;
          const displaySize = { 
            width: videoRef.current?.videoWidth || 300, 
            height: videoRef.current?.videoHeight || 225 
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
                
                // Only set if confident enough (above 0.5)
                if (maxExpression[1] > 0.5) {
                  setEmotion(maxExpression[0]);
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
          }, 100);
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please ensure you have given permission.");
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
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate AI response with more engaging responses
    setTimeout(() => {
      let response = "";
      
      // Emotion-aware responses with more personality
      if (emotion) {
        switch(emotion) {
          case 'happy':
            response = `🌟 Love that energy! You're radiating positivity! ${getResponseForInput(input)} Keep that smile shining, superstar!`;
            break;
          case 'sad':
            response = `💙 Hey, I see you might be feeling down. That's totally okay - we all have those days. ${getResponseForInput(input)} Remember, I'm here to lift you up and help you feel amazing again!`;
            break;
          case 'angry':
            response = `🔥 Whoa, feeling fired up? Let's channel that intensity into something awesome! ${getResponseForInput(input)} Sometimes our strongest emotions fuel our biggest breakthroughs!`;
            break;
          case 'neutral':
            response = `💯 ${getResponseForInput(input)}`;
            break;
          default:
            response = `✨ ${getResponseForInput(input)}`;
        }
      } else {
        response = `🎯 ${getResponseForInput(input)}`;
      }
      
      const aiMessage = {
        text: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1000);
  };

  const getResponseForInput = (input: string) => {
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('workout') || lowercaseInput.includes('exercise')) {
      return "🏋️‍♂️ Time to get SWOLE! I recommend mixing it up with cardio and strength training. Start with 30 minutes of heart-pumping cardio 3x a week, plus 2 days of muscle-building strength work. Don't forget to warm up and cool down - your body will thank you later!";
    }
    
    if (lowercaseInput.includes('diet') || lowercaseInput.includes('nutrition') || lowercaseInput.includes('food')) {
      return "🥗 Fuel your body like the machine it is! Focus on whole foods - colorful fruits, leafy greens, lean proteins, and whole grains. Hydrate like a champion with at least 8 glasses of H2O daily. Want me to hook you up with a killer meal plan?";
    }
    
    if (lowercaseInput.includes('sleep') || lowercaseInput.includes('tired')) {
      return "😴 Sleep is your secret weapon for recovery! Aim for 7-9 hours of quality shut-eye. Create a bedtime ritual, ditch the screens before bed, and keep your room cool and dark. Your gains happen while you snooze!";
    }
    
    if (lowercaseInput.includes('stress') || lowercaseInput.includes('anxious') || lowercaseInput.includes('anxiety')) {
      return "🧘‍♂️ Stress is just energy waiting to be redirected! Try 10 minutes of mindfulness daily, practice deep breathing, or take nature walks. These small habits are game-changers for your mental wellness!";
    }
    
    if (lowercaseInput.includes('motivation') || lowercaseInput.includes('lazy')) {
      return "🔥 Motivation is like a muscle - the more you flex it, the stronger it gets! Set small, achievable goals and celebrate every win. Find your squad or join our community. Remember your WHY - that's your superpower!";
    }
    
    return "🎪 That's an awesome question! As your AI wellness coach, I'm all about that balanced life - killer nutrition, consistent movement, hydration on point, and rest like a pro. What area should we dive deeper into first?";
  };

  const getEmotionIcon = () => {
    if (!emotion) return null;
    
    switch(emotion) {
      case 'happy':
        return <Smile className="h-6 w-6 text-green-500" />;
      case 'sad':
        return <Frown className="h-6 w-6 text-blue-500" />;
      case 'angry':
        return <Frown className="h-6 w-6 text-red-500" />;
      case 'neutral':
        return <Meh className="h-6 w-6 text-gray-500" />;
      default:
        return <SmilePlus className="h-6 w-6 text-safefit-primary" />;
    }
  };

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-0">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Enhanced BroAI Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="relative"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden">
                    {/* Animated background effect */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 opacity-30"
                    />
                    <Brain className="w-8 h-8 text-white z-10" />
                    {/* Sparkle effects */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1 right-1"
                    >
                      <Sparkles className="w-3 h-3 text-yellow-300" />
                    </motion.div>
                  </div>
                </motion.div>
                
                <div>
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                  >
                    BroAI ⚡
                  </motion.h1>
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-purple-600 font-medium"
                  >
                    Your Intelligent Wellness Companion
                  </motion.p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <AnimatePresence>
                  {emotion && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="flex items-center bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-lg border border-purple-200"
                    >
                      {getEmotionIcon()}
                      <span className="ml-2 text-sm capitalize font-medium text-purple-700">{emotion}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <Button
                  onClick={cameraActive ? stopCamera : startCamera}
                  disabled={!isModelLoaded || !hasAccess}
                  variant="outline"
                  className="bg-white/80 backdrop-blur-sm border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 shadow-lg"
                >
                  {cameraActive ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        
        {cameraActive && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mx-4 mb-4 relative"
          >
            <Card className="overflow-hidden bg-black shadow-xl border border-purple-200">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-auto"
                  style={{ maxHeight: '200px', objectFit: 'cover' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
            </Card>
          </motion.div>
        )}
        
        {!isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-4"
          >
            <Card className="p-4 border-dashed border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 shadow-lg">
              <div className="text-center py-3">
                <div className="flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-purple-600 mr-2" />
                  <p className="text-purple-800 font-bold">Premium Feature</p>
                </div>
                <p className="text-purple-600 text-sm mb-3">
                  Unlock all AI superpowers including emotion detection & advanced insights
                </p>
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.05 > 0.3 ? 0.1 : index * 0.05 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-lg ${
                    message.isUser
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-tr-sm'
                      : 'bg-white/80 backdrop-blur-sm text-gray-800 rounded-tl-sm border border-purple-100'
                  }`}
                >
                  <p className="leading-relaxed">{message.text}</p>
                  <p className={`text-xs ${message.isUser ? 'text-purple-100' : 'text-purple-500'} mt-2 opacity-75`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/80 backdrop-blur-sm text-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-lg border border-purple-100">
                  <div className="flex space-x-1">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-purple-500" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-blue-500" 
                    />
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-indigo-500" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-4 border-t border-purple-200 bg-white/80 backdrop-blur-sm">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BroAI anything about health, fitness, or wellness..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || !hasAccess}
              className="border-purple-200 focus:border-purple-400 bg-white/90 placeholder-purple-400"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim() || !hasAccess}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroAI;
