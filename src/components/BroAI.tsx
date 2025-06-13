
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, SmilePlus, Frown, Smile, Meh, Video, VideoOff } from 'lucide-react';
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
    // Add initial greeting message
    setMessages([
      {
        text: "Hey there! I'm your BroAI assistant. How can I help you today with your health and wellness goals?",
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
    
    // Simulate AI response
    setTimeout(() => {
      let response = "";
      
      // Emotion-aware responses
      if (emotion) {
        switch(emotion) {
          case 'happy':
            response = `I see you're smiling! That's great! ${getResponseForInput(input)}`;
            break;
          case 'sad':
            response = `You seem a bit down today. ${getResponseForInput(input)} Remember, I'm here to help you feel better.`;
            break;
          case 'angry':
            response = `You look a bit frustrated. ${getResponseForInput(input)} Let's work on bringing that stress level down.`;
            break;
          case 'neutral':
            response = getResponseForInput(input);
            break;
          default:
            response = getResponseForInput(input);
        }
      } else {
        response = getResponseForInput(input);
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
    // Simple response logic based on keywords
    const lowercaseInput = input.toLowerCase();
    
    if (lowercaseInput.includes('workout') || lowercaseInput.includes('exercise')) {
      return "For your workout goals, I recommend a mix of cardio and strength training. Start with 30 minutes of moderate intensity cardio 3 times a week, and add 2 days of full-body strength training. Remember to warm up and cool down!";
    }
    
    if (lowercaseInput.includes('diet') || lowercaseInput.includes('nutrition') || lowercaseInput.includes('food')) {
      return "Nutrition is key to your health goals! Focus on whole foods like fruits, vegetables, lean proteins, and whole grains. Stay hydrated by drinking at least 8 glasses of water daily. Would you like me to suggest a meal plan?";
    }
    
    if (lowercaseInput.includes('sleep') || lowercaseInput.includes('tired')) {
      return "Quality sleep is crucial for recovery! Try to get 7-9 hours of sleep each night. Establish a regular bedtime routine, avoid screens before bed, and keep your bedroom cool and dark for optimal rest.";
    }
    
    if (lowercaseInput.includes('stress') || lowercaseInput.includes('anxious') || lowercaseInput.includes('anxiety')) {
      return "I understand dealing with stress can be challenging. Consider practicing mindfulness meditation for 10 minutes daily, try deep breathing exercises, or take short walks outdoors. These small habits can significantly reduce stress levels.";
    }
    
    if (lowercaseInput.includes('motivation') || lowercaseInput.includes('lazy')) {
      return "Finding motivation can be tough! Try setting small, achievable goals and celebrate when you reach them. Find a workout buddy or join a community with similar goals. Remember why you started this journey!";
    }
    
    return "That's a great question! As your health and wellness AI, I'd recommend focusing on balanced nutrition, regular exercise, proper hydration, and adequate rest. Would you like more specific advice on any of these areas?";
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
    <div className="min-h-screen bg-safefit-white p-0">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="p-4 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-safefit-dark mb-2">BroAI</h1>
                <p className="text-safefit-primary">Your personal AI health assistant</p>
              </div>
              <div className="flex items-center space-x-2">
                {emotion && (
                  <div className="flex items-center bg-safefit-light py-1 px-3 rounded-full">
                    {getEmotionIcon()}
                    <span className="ml-2 text-sm capitalize text-safefit-primary">{emotion}</span>
                  </div>
                )}
                <Button
                  onClick={cameraActive ? stopCamera : startCamera}
                  disabled={!isModelLoaded || !hasAccess}
                  variant="outline"
                  className="bg-safefit-light border-safefit-border text-safefit-primary hover:bg-safefit-primary hover:text-white"
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
            <Card className="overflow-hidden bg-black">
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
            <Card className="p-4 border-dashed border-2 border-safefit-highlight/50 bg-safefit-light/50">
              <div className="text-center py-3">
                <p className="text-safefit-dark font-medium mb-2">Premium Feature</p>
                <p className="text-safefit-primary text-sm mb-3">
                  Subscribe to unlock all AI features including emotion detection
                </p>
                <Button 
                  className="bg-safefit-highlight hover:bg-safefit-highlight/90"
                  size="sm"
                >
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 > 1 ? 0.1 : index * 0.1 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-safefit-highlight text-white rounded-tr-none'
                      : 'bg-safefit-light text-safefit-dark rounded-tl-none'
                  }`}
                >
                  <p>{message.text}</p>
                  <p className={`text-xs ${message.isUser ? 'text-white/70' : 'text-safefit-primary'} mt-1`}>
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
                <div className="bg-safefit-light text-safefit-dark rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-safefit-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-safefit-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 rounded-full bg-safefit-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        <div className="p-4 border-t border-safefit-border bg-white">
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BroAI about health, fitness, or wellness..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading || !hasAccess}
              className="border-safefit-border focus:border-safefit-highlight"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim() || !hasAccess}
              className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
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
