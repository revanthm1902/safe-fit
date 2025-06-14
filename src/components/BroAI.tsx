
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Sparkles, Camera, Send, Mic, MicOff, Image, X } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { Input } from '@/components/ui/input';
import EmotionDisplay from './bro-ai/EmotionDisplay';
import MessageList from './bro-ai/MessageList';
import { getEmotionAwareResponse, getResponseForInput, handleEmotionChange } from './bro-ai/ResponseEngine';
import { createSpeechEngine } from './bro-ai/SpeechEngine';

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
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emotion, setEmotion] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const { speakText } = createSpeechEngine(soundEnabled);

  useEffect(() => {
    setMessages([
      {
        text: "Hey there! 👋 I'm BroAI, your personal wellness companion! I'm here to help you with health, fitness, and wellness questions. You can chat with me, use voice commands, or even send photos for analysis!",
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

  const handleEmotionDetected = (newEmotion: string) => {
    if (newEmotion !== emotion) {
      setEmotion(newEmotion);
      handleEmotionChange(newEmotion, setMessages, speakText);
    }
  };

  const startMicrophone = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
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
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setMicActive(false);
          setIsListening(false);
        };
        
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

  const sendImageWithMessage = () => {
    if (capturedImage) {
      const userMessage = {
        text: input || "Please analyze this image",
        isUser: true,
        timestamp: new Date(),
        image: capturedImage
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setCapturedImage(null);
      setShowImagePreview(false);
      setLoading(true);
      
      setTimeout(() => {
        const response = "I can see your image! As an AI wellness companion, I can provide general observations about wellness-related photos. For specific medical advice, please consult healthcare professionals.";
        
        const aiMessage = {
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        speakText(response);
        setLoading(false);
      }, 1500);
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
    setInput('');
    setLoading(true);
    
    setTimeout(() => {
      let response = getResponseForInput(input);
      
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
        <MessageList messages={messages} loading={loading} />
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
            className="flex-1 max-w-24 rounded-full bg-green-100 border-green-300"
          >
            <Image className="h-4 w-4 text-green-600" />
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
