import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Footprints, Flame, Moon, Droplet, Target, TrendingUp, Play, Plus, Clock, AlarmClock, ArrowLeft, Timer, Bell, Waves } from 'lucide-react';
import WorkoutMode from './fitness/WorkoutMode';
import WaterLogger from './fitness/WaterLogger';
import SleepMode from './fitness/SleepMode';
import MedicineReminder from './fitness/MedicineReminder';

const Fitness = () => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<string | null>(null);

  const stepsData = [{
    name: 'Completed',
    value: 8234,
    color: '#06b6d4'
  }, {
    name: 'Remaining',
    value: 1766,
    color: '#374151'
  }];

  const weeklyData = [{
    day: 'Mon',
    steps: 8500,
    calories: 320
  }, {
    day: 'Tue',
    steps: 7200,
    calories: 280
  }, {
    day: 'Wed',
    steps: 9100,
    calories: 350
  }, {
    day: 'Thu',
    steps: 8800,
    calories: 340
  }, {
    day: 'Fri',
    steps: 7500,
    calories: 290
  }, {
    day: 'Sat',
    steps: 10200,
    calories: 390
  }, {
    day: 'Sun',
    steps: 8234,
    calories: 315
  }];

  const fitnessMetrics = [{
    icon: Footprints,
    title: "Steps",
    value: "8,234",
    goal: "10,000",
    progress: 82,
    color: "from-cyan-500 to-blue-500"
  }, {
    icon: Flame,
    title: "Calories",
    value: "315",
    goal: "400",
    progress: 79,
    color: "from-orange-500 to-red-500"
  }, {
    icon: Moon,
    title: "Sleep",
    value: "7h 23m",
    goal: "8h",
    progress: 92,
    color: "from-indigo-500 to-purple-500"
  }, {
    icon: Droplet,
    title: "Hydration",
    value: "6/8",
    goal: "8 glasses",
    progress: 75,
    color: "from-blue-500 to-cyan-500"
  }];

  const quickActions = [
    {
      label: "Start Workout",
      color: "from-green-500 to-emerald-500",
      icon: Play,
      action: () => {
        setSelectedAction("workout");
        setActiveMode("workout");
      }
    },
    {
      label: "Log Water",
      color: "from-blue-500 to-cyan-500",
      icon: Plus,
      action: () => {
        setSelectedAction("water");
        setActiveMode("water");
      }
    },
    {
      label: "Sleep Mode",
      color: "from-indigo-500 to-purple-500",
      icon: Moon,
      action: () => {
        setSelectedAction("sleep");
        setActiveMode("sleep");
      }
    },
    {
      label: "Set Reminder",
      color: "from-orange-500 to-red-500",
      icon: AlarmClock,
      action: () => {
        setSelectedAction("reminder");
        setActiveMode("reminder");
      }
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-700 font-medium">{`${label}`}</p>
          <p className="text-cyan-600">{`Steps: ${payload[0].value.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };

  const renderActiveMode = () => {
    switch (activeMode) {
      case 'workout':
        return <WorkoutMode onBack={() => setActiveMode(null)} />;
      case 'water':
        return <WaterLogger onBack={() => setActiveMode(null)} />;
      case 'sleep':
        return <SleepMode onBack={() => setActiveMode(null)} />;
      case 'reminder':
        return <MedicineReminder onBack={() => setActiveMode(null)} />;
      default:
        return null;
    }
  };

  if (activeMode) {
    return (
      <div className="p-4 pt-12 bg-slate-800 min-h-screen">
        {renderActiveMode()}
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 bg-slate-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Fitness Tracker</h1>
        <p className="text-gray-300">Your daily activity and wellness goals</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {fitnessMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${metric.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{metric.value}</p>
                    <p className="text-sm text-gray-400">of {metric.goal}</p>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-300 font-medium">{metric.title}</span>
                    <span className="text-teal-400 text-sm">{metric.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.progress}%` }}
                      transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                      className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Today's Progress</h3>
            <div className="h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stepsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={450}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {stepsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="text-3xl font-bold text-white"
                >
                  82%
                </motion.p>
                <p className="text-gray-400 text-sm">Daily Goal</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Weekly Activity</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="steps"
                    fill="url(#stepsGradient)"
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                    animationBegin={200}
                  />
                  <defs>
                    <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            <Target className="w-6 h-6 text-teal-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={action.action}
                    className={`bg-gradient-to-r ${action.color} hover:opacity-90 text-white font-medium h-16 flex flex-col items-center justify-center space-y-1 relative overflow-hidden`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{action.label}</span>
                    {selectedAction === action.label.toLowerCase().split(' ')[0] && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 bg-white/20 rounded-md"
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Fitness;
