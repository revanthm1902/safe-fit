
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic } from 'lucide-react';

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
    <div className="p-6 border-t border-gray-800 bg-gray-900">
      <div className="flex space-x-3 items-end">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            disabled={loading || !hasAccess || isListening}
            className="border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 rounded-xl py-3"
          />
          {isListening && (
            <motion.p 
              className="text-center text-sm text-blue-400 mt-2 font-medium flex items-center justify-center"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="h-4 w-4 mr-2" />
              Listening...
            </motion.p>
          )}
        </div>
        <Button 
          onClick={onSendMessage} 
          disabled={loading || !input.trim() || !hasAccess || isListening}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-3 min-w-[48px] h-12"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
