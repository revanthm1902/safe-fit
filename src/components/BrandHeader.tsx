
import React from 'react';
import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrandHeaderProps {
  onSettingsClick?: () => void;
}

const BrandHeader = ({ onSettingsClick }: BrandHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-safefit-dark/90 backdrop-blur-lg border-b border-safefit-border/20">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex-1" />
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex justify-center"
        >
          <h1 className="text-2xl font-bold text-safefit-highlight text-glow font-poppins">
            SafeFit
          </h1>
        </motion.div>
        
        <div className="flex-1 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="text-safefit-highlight hover:bg-safefit-primary/20"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;
