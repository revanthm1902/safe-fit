
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  loading: boolean;
  hasAccess: boolean;
  isListening: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  onInputChange,
  onSendMessage,
  loading,
  hasAccess,
  isListening
}) => {
  return (
    <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="flex space-x-3">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={isListening ? "Listening..." : "Ask BroAI anything about wellness, fitness, or health..."}
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          disabled={loading || !hasAccess || isListening}
          className="border-gray-300 focus:border-purple-400 focus:ring-purple-400 bg-white/90 backdrop-blur-sm rounded-xl"
        />
        <Button 
          onClick={onSendMessage} 
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
  );
};

export default ChatInput;
