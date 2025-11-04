import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Heart, Droplets, Thermometer, Activity } from 'lucide-react';
import { useHealthMetrics } from '@/hooks/useHealthMetrics';

const Health = () => {
  const [selectedMetric, setSelectedMetric] = useState('heartRate');
  const [timeRange, setTimeRange] = useState('7d');
  const { currentMetrics, historicalData, loading, error, fetchHistoricalData } = useHealthMetrics();

  useEffect(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '15d' ? 15 : 30;
    fetchHistoricalData(selectedMetric, days);
  }, [selectedMetric, timeRange, fetchHistoricalData]);

  const metrics = [
    {
      id: 'heartRate',
      icon: Heart,
      label: 'Heart Rate',
      unit: 'BPM',
      color: '#ef4444',
      currentValue: currentMetrics?.heartRate,
    },
    {
      id: 'spo2',
      icon: Droplets,
      label: 'SpO2',
      unit: '%',
      color: '#3b82f6',
      currentValue: currentMetrics?.spo2,
    },
    {
      id: 'temp',
      icon: Thermometer,
      label: 'Temperature',
      unit: '°C',
      color: '#f59e0b',
      currentValue: currentMetrics?.temperature,
    },
    {
      id: 'stress',
      icon: Activity,
      label: 'Stress Level',
      unit: '/100',
      color: '#8b5cf6',
      currentValue: currentMetrics?.stress,
    },
  ];

  const currentMetric = metrics.find((m) => m.id === selectedMetric);
  const data = historicalData.length > 0 ? historicalData : [];

  if (loading) {
    return (
      <div className="p-4 pt-12 bg-slate-800 min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading health data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-12 bg-slate-800 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Health Vitals</h1>
        <p className="text-gray-300">Monitor your health trends and insights</p>
        {currentMetrics?.timestamp && (
          <p className="text-sm text-gray-400 mt-1">
            Last updated: {new Date(currentMetrics.timestamp).toLocaleString()}
          </p>
        )}
        {(!currentMetrics || currentMetrics.heartRate === 0) && (
          <p className="text-sm text-yellow-400 mt-1">
            ⚠️ No sensor data available. Connect your device to start tracking.
          </p>
        )}
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isSelected = selectedMetric === metric.id;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setSelectedMetric(metric.id)}
                variant="outline"
                className={`w-full p-4 h-auto flex flex-col items-center border-white/20 transition-all ${
                  isSelected
                    ? 'bg-white/20 border-teal-400 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/15'
                }`}
              >
                <Icon
                  className="w-6 h-6 mb-2"
                  style={{ color: isSelected ? metric.color : undefined }}
                />
                <span className="text-xs font-medium text-gray-50">{metric.label}</span>
                <span className="text-lg font-bold text-white mt-1">
                  {metric.currentValue?.toFixed(metric.id === 'temp' ? 1 : 0) || '--'}
                  <span className="text-xs ml-1">{metric.unit}</span>
                </span>
              </Button>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">{currentMetric?.label}</h3>
              <p className="text-gray-300">Track your {currentMetric?.label.toLowerCase()} over time</p>
            </div>
            <div className="flex space-x-2">
              {['7d', '15d', '30d'].map((range) => (
                <Button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  size="sm"
                  variant={timeRange === range ? 'default' : 'outline'}
                  className={`text-xs ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white'
                      : 'border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {range}
                </Button>
              ))}
            </div>
          </div>

          <div className="h-64">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentMetric?.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={currentMetric?.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={currentMetric?.color}
                    strokeWidth={3}
                    fill="url(#colorGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No historical data available
              </div>
            )}
          </div>

          {data.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Average</p>
                <p className="text-white font-bold">
                  {(data.reduce((sum, item) => sum + item.value, 0) / data.length).toFixed(
                    currentMetric?.id === 'temp' ? 1 : 0
                  )}
                  <span className="text-sm text-gray-400 ml-1">{currentMetric?.unit}</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Highest</p>
                <p className="text-white font-bold">
                  {Math.max(...data.map((item) => item.value)).toFixed(
                    currentMetric?.id === 'temp' ? 1 : 0
                  )}
                  <span className="text-sm text-gray-400 ml-1">{currentMetric?.unit}</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Lowest</p>
                <p className="text-white font-bold">
                  {Math.min(...data.map((item) => item.value)).toFixed(
                    currentMetric?.id === 'temp' ? 1 : 0
                  )}
                  <span className="text-sm text-gray-400 ml-1">{currentMetric?.unit}</span>
                </p>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};

export default Health;