
import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

const SplashScreen = () => {
  // Heart beat animation
  const heartAnimation = {
    beat: {
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  // Pulse circle animation
  const pulseAnimation = {
    pulse: {
      scale: [1, 1.2, 1.5],
      opacity: [0.6, 0.3, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  // Logo animation
  const logoAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 1,
        ease: "easeOut"
      }
    }
  };

  // Text animation
  const textAnimation = {
    hidden: { y: 20, opacity: 0 },
    visible: (custom: number) => ({ 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: custom * 0.3,
        duration: 0.8,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={logoAnimation}
          className="relative mb-12"
        >
          <div className="flex items-center justify-center relative">
            {/* Pulsing circles */}
            {[1, 2, 3].map((index) => (
              <motion.div
                key={index}
                variants={pulseAnimation}
                animate="pulse"
                custom={index * 0.4}
                style={{ animationDelay: `${index * 0.4}s` }}
                className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-safefit-primary/30 to-safefit-highlight/30"
              />
            ))}
            
            {/* Logo circle */}
            <div className="relative z-10 w-32 h-32 bg-gradient-to-r from-safefit-primary to-safefit-highlight rounded-full flex items-center justify-center shadow-lg">
              {/* Beating heart */}
              <motion.div
                variants={heartAnimation}
                animate="beat"
                className="text-white"
              >
                <Heart className="w-16 h-16" />
              </motion.div>
            </div>
          </div>
          
          <motion.h1
            variants={textAnimation}
            custom={1}
            className="text-5xl font-bold text-safefit-highlight mt-8 mb-4 font-poppins bg-clip-text text-transparent bg-gradient-to-r from-safefit-primary to-safefit-highlight"
          >
            SafeFit
          </motion.h1>
          
          <motion.p
            variants={textAnimation}
            custom={2}
            className="text-xl text-gray-600 font-poppins"
          >
            Your Health & Safety Companion
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="flex justify-center items-center space-x-3 mb-4">
            <motion.div
              variants={heartAnimation}
              animate="beat"
              className="text-safefit-primary"
            >
              <Heart className="w-6 h-6" />
            </motion.div>
            <span className="text-gray-700 font-poppins">Loading SafeFit...</span>
          </div>
          
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.3, 1],
                  backgroundColor: ['rgb(14, 165, 233)', 'rgb(236, 72, 153)', 'rgb(14, 165, 233)']
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-3 h-3 bg-safefit-primary rounded-full"
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
