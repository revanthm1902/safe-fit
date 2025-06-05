
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Mic, MicOff } from 'lucide-react';
import BrandHeader from './BrandHeader';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const BroAI = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! I'm Bro AI, your personal health and safety companion. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const quickActions = [
    "How's my health today?",
    "Remind me to hydrate",
    "Send SOS alert",
    "Check my sleep"
  ];

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(text),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (userText: string): string => {
    const responses = {
      health: "Based on your recent data, your heart rate is 72 BPM (normal), SpO2 is 98% (excellent), and you've taken 8,234 steps today. Keep up the great work! 💪",
      hydrate: "Got it! I'll remind you to drink water every 2 hours. Staying hydrated is crucial for optimal health! 💧",
      sos: "SOS feature activated. Your emergency contacts will be notified with your current location if you confirm the alert. Stay safe! 🚨",
      sleep: "You slept 7h 23m last night with 92% sleep quality. Your REM cycles look good! Try to maintain this schedule. 😴",
      default: "I'm here to help with your health, fitness, and safety needs. Try asking about your vitals, reminders, or emergency features! 🤖"
    };

    const lowerText = userText.toLowerCase();
    if (lowerText.includes('health') || lowerText.includes('vitals')) return responses.health;
    if (lowerText.includes('water') || lowerText.includes('hydrate')) return responses.hydrate;
    if (lowerText.includes('sos') || lowerText.includes('emergency')) return responses.sos;
    if (lowerText.includes('sleep')) return responses.sleep;
    return responses.default;
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-safefit-dark via-safefit-primary/10 to-safefit-dark">
      <BrandHeader />
      
      <div className="pt-20 pb-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-safefit-primary to-safefit-highlight rounded-full flex items-center justify-center pulse-glow">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-safefit-highlight font-poppins">Bro AI Assistant</h1>
          <p className="text-safefit-card font-poppins">Your intelligent health companion</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <Card className="mb-4 p-4 bg-safefit-card/20 backdrop-blur-lg border border-safefit-border/30 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.isUser 
                      ? 'bg-safefit-primary text-white' 
                      : 'bg-safefit-highlight/20 text-safefit-dark border border-safefit-border'
                  }`}>
                    <p className="font-poppins">{message.text}</p>
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </Card>

          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(action)}
                  className="border-safefit-border text-safefit-primary hover:bg-safefit-primary/20 font-poppins"
                >
                  {action}
                </Button>
              ))}
            </div>

            <div className="flex space-x-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                placeholder="Ask me about your health, safety, or set reminders..."
                className="flex-1 bg-safefit-card/20 border-safefit-border text-safefit-dark placeholder:text-safefit-primary/70 font-poppins"
              />
              <Button
                onClick={toggleListening}
                variant={isListening ? "default" : "outline"}
                size="icon"
                className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'border-safefit-border text-safefit-primary hover:bg-safefit-primary/20'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button
                onClick={() => handleSendMessage(inputText)}
                className="bg-safefit-primary hover:bg-safefit-primary/90 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BroAI;
