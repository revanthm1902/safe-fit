
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface EmotionDisplayProps {
  emotion: string | null;
}

const EmotionDisplay: React.FC<EmotionDisplayProps> = ({ emotion }) => {
  const getEmotionIcon = () => {
    if (!emotion) return <Heart className="h-5 w-5 text-pink-500" />;
    
    const emotionMap: { [key: string]: string } = {
      'happy': '😊',
      'sad': '😢',
      'angry': '😤',
      'surprised': '😲',
      'fearful': '😰',
      'disgusted': '😒',
      'neutral': '😐'
    };
    
    return <span className="text-lg">{emotionMap[emotion] || '🤖'}</span>;
  };

  if (!emotion) return null;

  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="flex items-center bg-white/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md border"
    >
      {getEmotionIcon()}
      <span className="ml-2 text-sm font-medium capitalize text-gray-700">{emotion}</span>
    </motion.div>
  );
};

export default EmotionDisplay;
