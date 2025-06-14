
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Droplets, Activity, Shield, TrendingUp, Crown, ChevronLeft, ChevronRight, Smartphone, Brain, Zap } from 'lucide-react';
import BrandHeader from './BrandHeader';

const Dashboard = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const features = [
    {
      icon: Heart,
      title: "Real-time Health Monitoring",
      description: "Track your vital signs with advanced AI-powered sensors",
      gradient: "from-red-500 via-pink-500 to-purple-500",
      image: "🩺"
    },
    {
      icon: Shield,
      title: "Advanced Safety Features",
      description: "Emergency contacts, SOS alerts, and live location tracking",
      gradient: "from-blue-500 via-cyan-500 to-teal-500",
      image: "🛡️"
    },
    {
      icon: Brain,
      title: "AI-Powered BroAI Assistant",
      description: "Your personal health companion with intelligent insights",
      gradient: "from-purple-500 via-indigo-500 to-blue-500",
      image: "🤖"
    },
    {
      icon: Activity,
      title: "Comprehensive Fitness Tracking",
      description: "Workout modes, sleep tracking, and nutrition monitoring",
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      image: "💪"
    },
    {
      icon: Zap,
      title: "Premium Experience",
      description: "Unlock exclusive features with our premium subscription",
      gradient: "from-yellow-500 via-orange-500 to-red-500",
      image: "⚡"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + features.length) % features.length);
  };

  const vitalsData = [
    {
      icon: Heart,
      title: "Heart Rate",
      value: "72",
      unit: "BPM",
      status: "Normal",
      color: "from-red-500 to-pink-500",
      trend: "+2%",
      progress: 85
    },
    {
      icon: Droplets,
      title: "SpO2 Level",
      value: "98",
      unit: "%",
      status: "Excellent",
      color: "from-blue-500 to-indigo-500",
      trend: "+1%",
      progress: 98
    },
    {
      icon: Activity,
      title: "Steps Today",
      value: "8,234",
      unit: "steps",
      status: "Goal: 10,000",
      color: "from-green-500 to-teal-500",
      trend: "+15%",
      progress: 82
    },
    {
      icon: Shield,
      title: "Safety Status",
      value: "Active",
      unit: "",
      status: "All systems OK",
      color: "from-purple-500 to-indigo-500",
      trend: "100%",
      progress: 100
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-safefit-dark via-safefit-primary/10 to-safefit-dark">
      <BrandHeader />
      
      <div className="pt-20 pb-24 px-4 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-safefit-highlight mb-2 font-poppins">Hello User!</h1>
          <p className="text-safefit-card font-poppins">Here's your health overview for today</p>
        </motion.div>

        {/* Premium Features Slideshow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-safefit-dark via-safefit-primary to-safefit-highlight shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="relative h-64 flex items-center justify-between p-8 text-white"
              >
                <div className="flex-1">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`inline-flex p-4 rounded-full bg-gradient-to-r ${features[currentSlide].gradient} mb-4`}
                  >
                    {React.createElement(features[currentSlide].icon, { className: "w-8 h-8 text-white" })}
                  </motion.div>
                  
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold mb-3 font-poppins"
                  >
                    {features[currentSlide].title}
                  </motion.h3>
                  
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/90 text-lg font-poppins"
                  >
                    {features[currentSlide].description}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-8xl ml-8"
                >
                  {features[currentSlide].image}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all duration-200"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>

            {/* Premium Badge */}
            <div className="absolute top-4 right-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center bg-yellow-500/20 backdrop-blur-sm rounded-full px-3 py-1 border border-yellow-400/30"
              >
                <Crown className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-yellow-400 text-sm font-semibold">Premium</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Vitals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {vitalsData.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-6 bg-safefit-card/20 backdrop-blur-lg border border-safefit-border/30 hover:bg-safefit-card/30 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${item.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center text-safefit-primary text-sm font-poppins">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {item.trend}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-safefit-primary text-sm font-medium font-poppins">{item.title}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold text-safefit-dark font-poppins">{item.value}</span>
                      {item.unit && <span className="text-safefit-primary ml-1 font-poppins">{item.unit}</span>}
                    </div>
                  </div>

                  {/* Progress Ring */}
                  <div className="mb-2">
                    <div className="w-full bg-safefit-border rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.progress}%` }}
                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                        className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                      />
                    </div>
                  </div>
                  
                  <p className="text-safefit-primary text-sm font-poppins">{item.status}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* SafeFit Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-safefit-card/20 backdrop-blur-lg border border-safefit-border/30">
            <h3 className="text-xl font-bold text-safefit-dark mb-4 font-poppins">SafeFit Summary</h3>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-safefit-primary w-12 font-poppins">{day}</span>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-safefit-border rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.random() * 100}%` }}
                        transition={{ delay: index * 0.1 + 0.7, duration: 0.8 }}
                        className="bg-gradient-to-r from-safefit-primary to-safefit-highlight h-2 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-safefit-primary text-sm font-poppins">{Math.floor(Math.random() * 15000)}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
