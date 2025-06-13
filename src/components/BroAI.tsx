
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, ArrowLeft, MoreHorizontal } from 'lucide-react';
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
        text: "Hey there! 👋 I'm BroAI, your personal wellness companion! I'm here to help you with health, fitness, and wellness guidance. What would you like to chat about?",
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 border-b border-gray-800">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Chat with AI Bot</h1>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Robot Character Section */}
        <div className="flex-shrink-0 p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block"
          >
            {/* Robot Character */}
            <div className="relative">
              <motion.div 
                className="w-32 h-32 mx-auto mb-6 relative"
                animate={{ 
                  y: cameraActive || micActive ? [0, -5, 0] : 0,
                  rotate: micActive ? [0, 2, -2, 0] : 0 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: cameraActive || micActive ? Infinity : 0 
                }}
              >
                {/* Robot Body */}
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-3xl relative shadow-2xl">
                  {/* Robot Face Screen */}
                  <div className="absolute inset-4 bg-gray-900 rounded-2xl flex items-center justify-center">
                    <div className="flex space-x-3">
                      <motion.div 
                        className="w-3 h-3 bg-cyan-400 rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="w-3 h-3 bg-cyan-400 rounded-full"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  {/* Robot Ears */}
                  <div className="absolute -left-2 top-6 w-4 h-8 bg-blue-400 rounded-full transform -rotate-12"></div>
                  <div className="absolute -right-2 top-6 w-4 h-8 bg-blue-400 rounded-full transform rotate-12"></div>
                  
                  {/* Activity Indicator */}
                  {(cameraActive || micActive) && (
                    <motion.div 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4 mb-6">
                <Button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
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

              {/* Emotion Display */}
              <EmotionDisplay emotion={emotion} />

              {/* Current Input Preview */}
              {input && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 max-w-sm mx-auto"
                >
                  <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2">
                    <p className="text-sm text-gray-300 truncate">{input}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Premium Notice */}
        {!isSubscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-6 mb-4"
          >
            <Card className="p-4 border border-purple-500/30 bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm">
              <div className="text-center py-2">
                <p className="text-purple-300 font-medium mb-2">🚀 Premium Features Available</p>
                <p className="text-purple-200 text-sm mb-3">
                  Unlock voice chat, emotion detection, and advanced AI capabilities
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
        
        {/* Messages */}
        <MessageList messages={messages} loading={loading} />
        
        {/* Input */}
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
