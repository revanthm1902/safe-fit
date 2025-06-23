
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  emotion?: string;
  image?: string;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onSpeakMessage?: (text: string) => void;
  soundEnabled?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, onSpeakMessage, soundEnabled = true }) => {
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="space-y-4 max-w-4xl mx-auto">
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
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-tr-md'
                  : 'bg-white text-gray-800 rounded-tl-md border border-gray-100'
              }`}
            >
              <div className="flex items-start space-x-2">
                {!message.isUser && (
                  <span className="text-lg mt-0.5 flex-shrink-0">🤖</span>
                )}
                <div className="flex-1 min-w-0">
                  {message.image && (
                    <div className="mb-2">
                      <img 
                        src={message.image} 
                        alt="Shared" 
                        className="max-w-full h-auto rounded-lg border border-gray-200"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <p className="leading-relaxed break-words">{message.text}</p>
                  <div className={`text-xs ${message.isUser ? 'text-white/70' : 'text-gray-500'} mt-2 flex items-center justify-between`}>
                    <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <div className="flex items-center space-x-2">
                      {message.emotion && !message.isUser && (
                        <span className="opacity-70 capitalize">😊 {message.emotion}</span>
                      )}
                      {!message.isUser && onSpeakMessage && soundEnabled && (
                        <Button
                          onClick={() => onSpeakMessage(message.text)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
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
            <div className="bg-white text-gray-800 rounded-2xl rounded-tl-md px-4 py-3 shadow-md border border-gray-100">
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
  );
};

export default MessageList;
