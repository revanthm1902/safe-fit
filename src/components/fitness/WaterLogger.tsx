
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Droplet, Plus, Minus, Target, TrendingUp } from 'lucide-react';

interface WaterLoggerProps {
  onBack: () => void;
}

const WaterLogger = ({ onBack }: WaterLoggerProps) => {
  const [waterIntake, setWaterIntake] = useState(6);
  const [dailyGoal] = useState(8);
  const [todayHistory, setTodayHistory] = useState([
    { time: '08:00', amount: 250 },
    { time: '10:30', amount: 200 },
    { time: '12:15', amount: 300 },
    { time: '14:45', amount: 250 },
    { time: '16:20', amount: 200 },
    { time: '18:10', amount: 300 }
  ]);

  const addWater = () => {
    if (waterIntake < 12) {
      setWaterIntake(waterIntake + 1);
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      setTodayHistory([...todayHistory, { time: timeString, amount: 250 }]);
    }
  };

  const removeWater = () => {
    if (waterIntake > 0) {
      setWaterIntake(waterIntake - 1);
      setTodayHistory(todayHistory.slice(0, -1));
    }
  };

  const percentage = Math.min((waterIntake / dailyGoal) * 100, 100);
  const totalMl = todayHistory.reduce((sum, entry) => sum + entry.amount, 0);

  return (
    <div className="min-h-screen">
      <div className="flex items-center mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-white hover:bg-white/10 p-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-white ml-4">Water Logger</h1>
      </div>

      <div className="space-y-6">
        {/* Hydration Status */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4"
            >
              <Droplet className="w-20 h-20 text-blue-400 mx-auto" />
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-2">
              {waterIntake}/{dailyGoal} Glasses
            </h3>
            <p className="text-gray-300 mb-4">{totalMl}ml consumed today</p>
            
            <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className="h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
                transition={{ duration: 0.8 }}
              />
            </div>
            <p className="text-teal-400 font-medium">{percentage.toFixed(0)}% of daily goal</p>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Log Water Intake</h3>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={removeWater}
              disabled={waterIntake === 0}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white p-4"
            >
              <Minus className="w-6 h-6" />
            </Button>
            <div className="flex items-center bg-white/10 px-6 py-4 rounded-lg">
              <Droplet className="w-6 h-6 text-blue-400 mr-2" />
              <span className="text-2xl font-bold text-white">{waterIntake}</span>
            </div>
            <Button
              onClick={addWater}
              disabled={waterIntake >= 12}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white p-4"
            >
              <Plus className="w-6 h-6" />
            </Button>
          </div>
          <p className="text-center text-gray-400 mt-4">Each glass = ~250ml</p>
        </Card>

        {/* Today's History */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2" />
            Today's Hydration Timeline
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {todayHistory.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center">
                  <Droplet className="w-4 h-4 text-blue-400 mr-3" />
                  <span className="text-white">{entry.time}</span>
                </div>
                <span className="text-gray-300">{entry.amount}ml</span>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Hydration Tips */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="w-6 h-6 mr-2" />
            Hydration Tips
          </h3>
          <div className="space-y-3 text-gray-300">
            <p>• Drink a glass of water when you wake up</p>
            <p>• Keep a water bottle visible as a reminder</p>
            <p>• Set hourly reminders to drink water</p>
            <p>• Eat water-rich foods like fruits and vegetables</p>
            <p>• Monitor urine color - pale yellow indicates good hydration</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WaterLogger;
