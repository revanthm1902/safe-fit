
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Heart, Droplets, Activity, Shield, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const vitalsData = [
    {
      icon: Heart,
      title: "Heart Rate",
      value: "72",
      unit: "BPM",
      status: "Normal",
      color: "from-red-500 to-pink-500",
      trend: "+2%"
    },
    {
      icon: Droplets,
      title: "SpO2 Level",
      value: "98",
      unit: "%",
      status: "Excellent",
      color: "from-blue-500 to-indigo-500",
      trend: "+1%"
    },
    {
      icon: Activity,
      title: "Steps Today",
      value: "8,234",
      unit: "steps",
      status: "Goal: 10,000",
      color: "from-green-500 to-teal-500",
      trend: "+15%"
    },
    {
      icon: Shield,
      title: "Safety Status",
      value: "Active",
      unit: "",
      status: "All systems OK",
      color: "from-purple-500 to-indigo-500",
      trend: "100%"
    }
  ];

  return (
    <div className="p-4 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Good Morning!</h1>
        <p className="text-gray-300">Here's your health overview for today</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {vitalsData.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${item.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center text-teal-400 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {item.trend}
                  </div>
                </div>
                
                <div className="mb-2">
                  <h3 className="text-gray-300 text-sm font-medium">{item.title}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-white">{item.value}</span>
                    {item.unit && <span className="text-gray-400 ml-1">{item.unit}</span>}
                  </div>
                </div>
                
                <p className="text-teal-400 text-sm">{item.status}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Weekly Summary</h3>
          <div className="space-y-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="flex items-center justify-between">
                <span className="text-gray-300 w-12">{day}</span>
                <div className="flex-1 mx-4">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.random() * 100}%` }}
                      transition={{ delay: index * 0.1, duration: 0.8 }}
                      className="bg-gradient-to-r from-teal-400 to-purple-500 h-2 rounded-full"
                    />
                  </div>
                </div>
                <span className="text-teal-400 text-sm">{Math.floor(Math.random() * 15000)}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Dashboard;
