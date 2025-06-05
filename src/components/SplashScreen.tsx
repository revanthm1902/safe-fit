
import React from 'react';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 via-purple-600 to-indigo-800">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(45, 212, 191, 0.5)",
                "0 0 40px rgba(45, 212, 191, 0.8)",
                "0 0 20px rgba(45, 212, 191, 0.5)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full flex items-center justify-center"
          >
            <span className="text-4xl font-bold text-white">SF</span>
          </motion.div>
          
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-5xl font-bold text-white mb-4"
          >
            SafeFit
          </motion.h1>
          
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-xl text-teal-200"
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
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-teal-400 rounded-full"
              />
            ))}
          </div>
          <p className="text-teal-300 mt-4">Loading your personalized experience...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
