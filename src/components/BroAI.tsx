
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Send, Smile, Frown, Meh, Camera, X } from 'lucide-react';
import * as faceapi from 'face-api.js';

const BroAI = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{role: string, content: string, time: Date}[]>([
    {
      role: 'ai',
      content: "Hey bro, I'm your fitness buddy! How are you feeling today?",
      time: new Date()
    }
  ]);
  const [cameraActive, setCameraActive] = useState(false);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        
        // Display loading message in chat
        setChat(prev => [...prev, {
          role: 'system',
          content: 'Loading facial recognition models...',
          time: new Date()
        }]);
        
        // Load models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        
        // Update chat with success message
        setChat(prev => [
          ...prev.filter(msg => msg.role !== 'system'),
          {
            role: 'system',
            content: 'Facial recognition activated! I can now see how you\'re feeling.',
            time: new Date()
          }
        ]);
      } catch (error) {
        console.error('Error loading models:', error);
        setChat(prev => [...prev, {
          role: 'system',
          content: 'Failed to load facial recognition models. Try refreshing the page.',
          time: new Date()
        }]);
      }
    };
    
    loadModels();
  }, []);
  
  // Start camera when user activates it
  const startCamera = async () => {
    if (!modelsLoaded) {
      setChat(prev => [...prev, {
        role: 'system',
        content: 'Please wait for models to load first.',
        time: new Date()
      }]);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setCameraActive(true);
      detectFace();
      
    } catch (err) {
      console.error("Error accessing camera:", err);
      setChat(prev => [...prev, {
        role: 'system',
        content: 'Unable to access your camera. Please check permissions.',
        time: new Date()
      }]);
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
      setEmotion(null);
    }
  };
  
  // Detect facial expressions
  const detectFace = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Create detection interval
    const interval = setInterval(async () => {
      if (!video || !canvas || !cameraActive) {
        clearInterval(interval);
        return;
      }
      
      // Only process when video is playing
      if (video.paused || video.ended) return;
      
      // Detect faces with expressions
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();
        
      // Clear previous drawings
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Check if we found a face
      if (detections && detections.length > 0) {
        // Draw results
        faceapi.draw.drawDetections(canvas, detections);
        faceapi.draw.drawFaceExpressions(canvas, detections);
        
        // Get highest confidence emotion
        const expressions = detections[0].expressions;
        let highestExpression = Object.keys(expressions).reduce((a, b) => 
          expressions[a] > expressions[b] ? a : b
        );
        
        // Only update if significant confidence (above 0.5)
        if (expressions[highestExpression] > 0.5) {
          // Map to simpler emotions
          let simplifiedEmotion;
          if (['happy', 'surprised'].includes(highestExpression)) {
            simplifiedEmotion = 'happy';
          } else if (['sad', 'fearful', 'disgusted', 'angry'].includes(highestExpression)) {
            simplifiedEmotion = 'sad';
          } else {
            simplifiedEmotion = 'neutral';
          }
          
          // If emotion changed, respond
          if (simplifiedEmotion !== emotion) {
            setEmotion(simplifiedEmotion);
            respondToEmotion(simplifiedEmotion);
          }
        }
      }
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  };
  
  // AI response based on detected emotion
  const respondToEmotion = (detectedEmotion: string) => {
    let response = '';
    
    switch (detectedEmotion) {
      case 'happy':
        response = "You seem happy today! That's awesome, bro! Let's channel that positive energy into a great workout!";
        break;
      case 'sad':
        response = "Hey bro, you seem down. Remember, exercise releases endorphins that can help boost your mood. Want to talk about it?";
        break;
      case 'neutral':
        response = "I see you're pretty neutral today. How about we set some fitness goals to get you energized?";
        break;
      default:
        return;
    }
    
    // Add AI message to chat
    setChat(prev => [...prev, {
      role: 'ai',
      content: response,
      time: new Date()
    }]);
  };
  
  // Submit user message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    // Add user message
    setChat(prev => [...prev, {
      role: 'user',
      content: message,
      time: new Date()
    }]);
    
    // Simulate AI response
    setTimeout(() => {
      let response = "That's cool, bro! Keep pushing yourself and stay motivated. Let me know if you need any fitness advice!";
      
      // Check for specific keywords
      if (message.toLowerCase().includes('workout')) {
        response = "Working out is key to hitting your goals! Remember to maintain proper form and stay hydrated.";
      } else if (message.toLowerCase().includes('diet') || message.toLowerCase().includes('food')) {
        response = "Nutrition is crucial, bro! Make sure you're getting enough protein and watch those macros.";
      } else if (message.toLowerCase().includes('tired') || message.toLowerCase().includes('exhausted')) {
        response = "Feeling tired is normal, but don't let it stop you. Listen to your body, get proper rest, but keep consistent.";
      }
      
      setChat(prev => [...prev, {
        role: 'ai',
        content: response,
        time: new Date()
      }]);
    }, 1000);
    
    // Clear input
    setMessage('');
  };
  
  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chat]);
  
  // Get emotion icon
  const getEmotionIcon = () => {
    switch (emotion) {
      case 'happy':
        return <Smile className="w-6 h-6 text-green-500" />;
      case 'sad':
        return <Frown className="w-6 h-6 text-blue-500" />;
      case 'neutral':
        return <Meh className="w-6 h-6 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 pt-12 pb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-800">BroAI</h1>
          <div className="flex items-center space-x-2">
            {emotion && getEmotionIcon()}
            <Button
              onClick={cameraActive ? stopCamera : startCamera}
              variant={cameraActive ? "destructive" : "outline"}
              size="sm"
              className={`${cameraActive ? "bg-red-600 hover:bg-red-700" : "border-gray-300 text-gray-700"}`}
            >
              {cameraActive ? <X className="w-4 h-4 mr-1" /> : <Camera className="w-4 h-4 mr-1" />}
              {cameraActive ? "Stop Camera" : "Start Camera"}
            </Button>
          </div>
        </div>
        <p className="text-gray-600">Your personal fitness motivation companion</p>
      </motion.div>

      {/* Camera View */}
      {cameraActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="relative mx-4 mb-4 overflow-hidden rounded-xl shadow-lg"
          style={{ maxHeight: "30vh" }}
        >
          <div className="relative w-full" style={{ maxHeight: "30vh" }}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full object-cover rounded-xl"
              style={{ maxHeight: "30vh" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </motion.div>
      )}

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <div className="flex flex-col space-y-4">
          {chat.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : msg.role === 'system'
                      ? 'bg-gray-200 text-gray-800'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!message.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BroAI;
