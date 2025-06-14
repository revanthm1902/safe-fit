
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Square, Timer, Dumbbell, Activity } from 'lucide-react';

interface WorkoutModeProps {
  onBack: () => void;
}

const WorkoutMode = ({ onBack }: WorkoutModeProps) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [currentExercise, setCurrentExercise] = useState(0);

  const exercises = [
    { name: "Push-ups", duration: 30, image: "💪" },
    { name: "Squats", duration: 45, image: "🏋️" },
    { name: "Plank", duration: 60, image: "🤸" },
    { name: "Burpees", duration: 30, image: "🏃" },
    { name: "Mountain Climbers", duration: 40, image: "🧗" }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => time + 1);
      }, 1000);
    } else if (!isActive && time !== 0) {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsActive(false);
  const handleReset = () => {
    setTime(0);
    setIsActive(false);
    setCurrentExercise(0);
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      setCurrentExercise(0);
    }
  };

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
        <h1 className="text-2xl font-bold text-white ml-4">Workout Mode</h1>
      </div>

      <div className="space-y-6">
        {/* Timer Card */}
        <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20 text-center">
          <motion.div
            animate={{ scale: isActive ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
            className="mb-6"
          >
            <Timer className="w-16 h-16 text-teal-400 mx-auto mb-4" />
            <div className="text-6xl font-mono text-white mb-2">
              {formatTime(time)}
            </div>
            <div className="text-gray-300">Total Workout Time</div>
          </motion.div>

          <div className="flex justify-center space-x-4">
            {!isActive ? (
              <Button
                onClick={handleStart}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}
            <Button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-3"
            >
              <Square className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </div>
        </Card>

        {/* Current Exercise */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-4">{exercises[currentExercise].image}</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {exercises[currentExercise].name}
            </h3>
            <p className="text-gray-300 mb-4">
              Recommended: {exercises[currentExercise].duration} seconds
            </p>
            <Button
              onClick={nextExercise}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              Next Exercise
            </Button>
          </div>
        </Card>

        {/* Exercise List */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Dumbbell className="w-6 h-6 mr-2" />
            Today's Exercises
          </h3>
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <motion.div
                key={index}
                className={`p-4 rounded-lg border transition-all ${
                  index === currentExercise
                    ? 'bg-teal-500/20 border-teal-400'
                    : 'bg-white/5 border-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{exercise.image}</span>
                    <div>
                      <div className="text-white font-medium">{exercise.name}</div>
                      <div className="text-gray-400 text-sm">{exercise.duration}s</div>
                    </div>
                  </div>
                  {index === currentExercise && (
                    <Activity className="w-5 h-5 text-teal-400" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutMode;
