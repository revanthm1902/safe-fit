
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Shield, Activity, ChevronRight, Check } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen = ({ onComplete }: OnboardingScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Heart,
      title: "Health Monitoring",
      description: "Track your heart rate, SpO2, and vital signs in real-time with advanced analytics.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Emergency SOS, fall detection, and instant alerts to keep you safe anywhere.",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Activity,
      title: "Lifestyle Tracking",
      description: "Monitor your fitness, sleep patterns, and daily activities for a healthier you.",
      color: "from-green-500 to-teal-500"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to SafeFit</h1>
          <p className="text-gray-300">Let's explore what makes you safer and healthier</p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${steps[currentStep].color} rounded-full flex items-center justify-center`}
              >
                <steps[currentStep].icon className="w-10 h-10 text-white" />
              </motion.div>

              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-white mb-4"
              >
                {steps[currentStep].title}
              </motion.h2>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-gray-300 text-lg mb-8"
              >
                {steps[currentStep].description}
              </motion.p>

              <div className="flex justify-center space-x-2 mb-8">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentStep ? 'bg-teal-400 w-8' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={skipOnboarding}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  Skip
                </Button>
                <Button
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Get Started
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingScreen;
