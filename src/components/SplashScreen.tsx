
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-safefit-dark via-safefit-primary/20 to-safefit-dark">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <motion.div
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-safefit-primary to-safefit-highlight rounded-full flex items-center justify-center pulse-glow"
          >
            <span className="text-4xl font-bold text-white font-poppins">SF</span>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-bold text-safefit-highlight mb-4 text-glow font-poppins"
          >
            SafeFit
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl text-safefit-card font-poppins"
          >
            Your Health & Safety Companion
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="mt-12"
        >
          <div className="flex justify-center items-center space-x-3 mb-4">
            <Heart className="w-6 h-6 text-red-500 beating-heart" />
            <span className="text-safefit-highlight font-poppins">Loading SafeFit...</span>
          </div>
          
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-safefit-primary rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
