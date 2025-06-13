import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';
const Health = () => {
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [timeRange, setTimeRange] = useState('7d');
  const generateData = (metric: string) => {
    const days = timeRange === '7d' ? 7 : timeRange === '15d' ? 15 : 30;
    return Array.from({
      length: days
    }, (_, i) => ({
      day: i + 1,
      value: metric === 'heartRate' ? 65 + Math.random() * 20 : metric === 'spo2' ? 95 + Math.random() * 5 : metric === 'temp' ? 36 + Math.random() * 2 : 50 + Math.random() * 50
    }));
  };
  const metrics = [{
    id: 'heartRate',
    icon: Heart,
    label: 'Heart Rate',
    unit: 'BPM',
    color: '#ef4444'
  }, {
    id: 'spo2',
    icon: Droplets,
    label: 'SpO2',
    unit: '%',
    color: '#3b82f6'
  }, {
    id: 'temp',
    icon: Thermometer,
    label: 'Temperature',
    unit: '°C',
    color: '#f59e0b'
  }, {
    id: 'stress',
    icon: Activity,
    label: 'Stress Level',
    unit: '/100',
    color: '#8b5cf6'
  }];
  const currentMetric = metrics.find(m => m.id === selectedMetric);
  const data = generateData(selectedMetric);
  return <div className="p-4 pt-12 bg-slate-800">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Health Vitals</h1>
        <p className="text-gray-300">Monitor your health trends and insights</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const isSelected = selectedMetric === metric.id;
        return <motion.div key={metric.id} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: index * 0.1
        }} whileTap={{
          scale: 0.95
        }}>
              <Button onClick={() => setSelectedMetric(metric.id)} variant="outline" className="bg-safefit-highlight">
                <Icon className="w-6 h-6 mb-2" style={{
              color: isSelected ? metric.color : undefined
            }} />
                <span className="text-xs font-medium text-gray-50">{metric.label}</span>
              </Button>
            </motion.div>;
      })}
      </div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: 0.3
    }}>
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{currentMetric?.label}</h3>
              <p className="text-gray-300">Track your {currentMetric?.label.toLowerCase()} over time</p>
            </div>
            <div className="flex space-x-2">
              {['7d', '15d', '30d'].map(range => <Button key={range} onClick={() => setTimeRange(range)} size="sm" variant={timeRange === range ? "default" : "outline"} className={`text-xs ${timeRange === range ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' : 'border-white/20 text-gray-300 hover:bg-white/10'}`}>
                  {range}
                </Button>)}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={currentMetric?.color} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={currentMetric?.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{
                fill: '#9ca3af',
                fontSize: 12
              }} />
                <YAxis axisLine={false} tickLine={false} tick={{
                fill: '#9ca3af',
                fontSize: 12
              }} />
                <Area type="monotone" dataKey="value" stroke={currentMetric?.color} strokeWidth={3} fill="url(#colorGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Average</p>
              <p className="text-white font-bold">
                {Math.round(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
                <span className="text-sm text-gray-400 ml-1">{currentMetric?.unit}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Highest</p>
              <p className="text-white font-bold">
                {Math.round(Math.max(...data.map(item => item.value)))}
                <span className="text-sm text-gray-400 ml-1">{currentMetric?.unit}</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Lowest</p>
              <p className="text-white font-bold">
                {Math.round(Math.min(...data.map(item => item.value)))}
                <span className="text-sm text-gray-400 ml-1">{currentMetric?.unit}</span>
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>;
};
export default Health;