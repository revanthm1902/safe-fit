
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Moon, Sun, Bell, Waves, Volume2, VolumeX } from 'lucide-react';

interface SleepModeProps {
  onBack: () => void;
}

const SleepMode = ({ onBack }: SleepModeProps) => {
  const [sleepMode, setSleepMode] = useState(false);
  const [bedtime, setBedtime] = useState('22:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }));
  const [sleepPhase, setSleepPhase] = useState('awake');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activateSleepMode = () => {
    setSleepMode(true);
    setSleepPhase('falling-asleep');
    // Simulate sleep phases
    setTimeout(() => setSleepPhase('light-sleep'), 2000);
    setTimeout(() => setSleepPhase('deep-sleep'), 5000);
  };

  const deactivateSleepMode = () => {
    setSleepMode(false);
    setSleepPhase('awake');
  };

  const sleepStats = {
    lastNight: '7h 23m',
    average: '7h 15m',
    deepSleep: '2h 14m',
    lightSleep: '5h 09m'
  };

  const getSleepPhaseColor = () => {
    switch (sleepPhase) {
      case 'falling-asleep': return 'from-indigo-400 to-purple-400';
      case 'light-sleep': return 'from-blue-400 to-indigo-400';
      case 'deep-sleep': return 'from-purple-600 to-indigo-800';
      default: return 'from-yellow-400 to-orange-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-violet-50">
      <div className="flex items-center mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-gray-800 hover:bg-white/50 p-2"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-800 ml-4">Sleep Mode</h1>
      </div>

      <div className="space-y-6">
        {/* Sleep Status */}
        <Card className="p-6 bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <div className="text-center">
            <motion.div
              animate={{ 
                scale: sleepMode ? [1, 1.1, 1] : 1,
                rotate: sleepMode ? [0, 10, -10, 0] : 0
              }}
              transition={{ duration: 3, repeat: sleepMode ? Infinity : 0 }}
              className={`mb-4 p-6 rounded-full bg-gradient-to-r ${getSleepPhaseColor()} inline-block`}
            >
              {sleepMode ? (
                <Moon className="w-16 h-16 text-white" />
              ) : (
                <Sun className="w-16 h-16 text-white" />
              )}
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {sleepMode ? 'Sleep Mode Active' : 'Sleep Mode Inactive'}
            </h3>
            <p className="text-gray-600 mb-4 capitalize">
              {sleepPhase.replace('-', ' ')} Phase
            </p>
            <div className="text-lg text-indigo-600 font-mono mb-6">
              Current Time: {currentTime}
            </div>

            {!sleepMode ? (
              <Button
                onClick={activateSleepMode}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3"
              >
                <Moon className="w-5 h-5 mr-2" />
                Activate Sleep Mode
              </Button>
            ) : (
              <Button
                onClick={deactivateSleepMode}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3"
              >
                <Sun className="w-5 h-5 mr-2" />
                Wake Up
              </Button>
            )}
          </div>
        </Card>

        {/* Sleep Schedule */}
        <Card className="p-6 bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Sleep Schedule
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-600 text-sm">Bedtime</label>
              <input
                type="time"
                value={bedtime}
                onChange={(e) => setBedtime(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800"
              />
            </div>
            <div>
              <label className="text-gray-600 text-sm">Wake Time</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-800"
              />
            </div>
          </div>
        </Card>

        {/* Sleep Sounds */}
        <Card className="p-6 bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Waves className="w-6 h-6 mr-2" />
            Sleep Sounds
          </h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800">Enable Sleep Sounds</span>
            <Button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`${soundEnabled ? 'bg-green-500' : 'bg-gray-400'} text-white`}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
          {soundEnabled && (
            <div className="grid grid-cols-2 gap-3">
              {['Rain', 'Ocean', 'Forest', 'White Noise'].map((sound) => (
                <Button
                  key={sound}
                  className="bg-indigo-100 hover:bg-indigo-200 text-gray-800"
                >
                  {sound}
                </Button>
              ))}
            </div>
          )}
        </Card>

        {/* Sleep Stats */}
        <Card className="p-6 bg-white/80 backdrop-blur-lg border-0 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Sleep Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-gray-800">{sleepStats.lastNight}</div>
              <div className="text-gray-600 text-sm">Last Night</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-gray-800">{sleepStats.average}</div>
              <div className="text-gray-600 text-sm">7-Day Average</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-gray-800">{sleepStats.deepSleep}</div>
              <div className="text-gray-600 text-sm">Deep Sleep</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-2xl font-bold text-gray-800">{sleepStats.lightSleep}</div>
              <div className="text-gray-600 text-sm">Light Sleep</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SleepMode;
