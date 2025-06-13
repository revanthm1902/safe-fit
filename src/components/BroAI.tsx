
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useSubscription } from '@/contexts/SubscriptionContext';
import CameraControls from './bro-ai/CameraControls';
import MicrophoneControls from './bro-ai/MicrophoneControls';
import EmotionDisplay from './bro-ai/EmotionDisplay';
import MessageList from './bro-ai/MessageList';
import ChatInput from './bro-ai/ChatInput';
import { getEmotionAwareResponse, getResponseForInput, handleEmotionChange } from './bro-ai/ResponseEngine';
import { createSpeechEngine } from './bro-ai/SpeechEngine';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  emotion?: string;
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
  const { isSubscribed, checkFeatureAccess } = useSubscription();

  const hasAccess = checkFeatureAccess('ai-assistant');
  const { speakText } = createSpeechEngine(soundEnabled);

  useEffect(() => {
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

  const handleEmotionDetected = (newEmotion: string) => {
    if (newEmotion !== emotion) {
      setEmotion(newEmotion);
      handleEmotionChange(newEmotion, setMessages, speakText);
    }
  };

  const handleMicToggle = (active: boolean, transcript?: string) => {
    setMicActive(active);
    if (transcript) {
      setInput(transcript);
    }
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
                <EmotionDisplay emotion={emotion} />
                
                <Button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  variant="outline"
                  size="sm"
                  className={`${soundEnabled ? 'bg-green-100 border-green-300' : 'bg-gray-100'} hover:scale-105 transition-transform`}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-green-600" /> : <VolumeX className="h-4 w-4 text-gray-500" />}
                </Button>
                
                <MicrophoneControls
                  micActive={micActive}
                  onMicToggle={handleMicToggle}
                  hasAccess={hasAccess}
                  speakText={speakText}
                  onListeningChange={setIsListening}
                />
                
                <CameraControls
                  isModelLoaded={isModelLoaded}
                  cameraActive={cameraActive}
                  onEmotionChange={handleEmotionDetected}
                  onCameraToggle={setCameraActive}
                  hasAccess={hasAccess}
                  speakText={speakText}
                  isListening={isListening}
                />
              </div>
            </div>
          </motion.div>
        </div>
        
        <AnimatePresence>
          {/* Camera view is handled within CameraControls component */}
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
        
        <MessageList messages={messages} loading={loading} />
        
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
          loading={loading}
          hasAccess={hasAccess}
          isListening={isListening}
        />
      </div>
    </div>
  );
};

export default BroAI;
