
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Bell, Clock, Pill, Trash2, AlertCircle } from 'lucide-react';

interface MedicineReminderProps {
  onBack: () => void;
}

interface Reminder {
  id: string;
  medicineName: string;
  dosage: string;
  times: string[];
  days: string[];
  duration: number;
  startDate: string;
}

const MedicineReminder = ({ onBack }: MedicineReminderProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: '1',
      medicineName: 'Vitamin D',
      dosage: '1 tablet',
      times: ['09:00'],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      duration: 30,
      startDate: '2024-01-01'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    medicineName: '',
    dosage: '',
    times: [''],
    days: [] as string[],
    duration: 7
  });

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const addReminder = () => {
    if (newReminder.medicineName && newReminder.dosage && newReminder.times[0]) {
      const reminder: Reminder = {
        id: Date.now().toString(),
        medicineName: newReminder.medicineName,
        dosage: newReminder.dosage,
        times: newReminder.times.filter(time => time !== ''),
        days: newReminder.days,
        duration: newReminder.duration,
        startDate: new Date().toISOString().split('T')[0]
      };
      setReminders([...reminders, reminder]);
      setNewReminder({
        medicineName: '',
        dosage: '',
        times: [''],
        days: [],
        duration: 7
      });
      setShowAddForm(false);
    }
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const toggleDay = (day: string) => {
    if (newReminder.days.includes(day)) {
      setNewReminder({
        ...newReminder,
        days: newReminder.days.filter(d => d !== day)
      });
    } else {
      setNewReminder({
        ...newReminder,
        days: [...newReminder.days, day]
      });
    }
  };

  const addTimeSlot = () => {
    setNewReminder({
      ...newReminder,
      times: [...newReminder.times, '']
    });
  };

  const updateTime = (index: number, time: string) => {
    const newTimes = [...newReminder.times];
    newTimes[index] = time;
    setNewReminder({
      ...newReminder,
      times: newTimes
    });
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
        <h1 className="text-2xl font-bold text-white ml-4">Medicine Reminders</h1>
      </div>

      <div className="space-y-6">
        {/* Add New Reminder Button */}
        {!showAddForm && (
          <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white py-4"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Medicine Reminder
            </Button>
          </Card>
        )}

        {/* Add Reminder Form */}
        {showAddForm && (
          <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Pill className="w-6 h-6 mr-2" />
              New Medicine Reminder
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm">Medicine Name</label>
                <input
                  type="text"
                  value={newReminder.medicineName}
                  onChange={(e) => setNewReminder({...newReminder, medicineName: e.target.value})}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="e.g., Aspirin, Vitamin C"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Dosage</label>
                <input
                  type="text"
                  value={newReminder.dosage}
                  onChange={(e) => setNewReminder({...newReminder, dosage: e.target.value})}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="e.g., 1 tablet, 2 capsules"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm">Times</label>
                {newReminder.times.map((time, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => updateTime(index, e.target.value)}
                      className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                ))}
                <Button
                  onClick={addTimeSlot}
                  className="bg-blue-500 hover:bg-blue-600 text-white mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Time
                </Button>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Days of Week</label>
                <div className="grid grid-cols-7 gap-2">
                  {daysOfWeek.map(day => (
                    <Button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`${
                        newReminder.days.includes(day)
                          ? 'bg-teal-500 text-white'
                          : 'bg-white/10 text-gray-300'
                      } hover:bg-teal-600`}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm">Duration (days)</label>
                <input
                  type="number"
                  value={newReminder.duration}
                  onChange={(e) => setNewReminder({...newReminder, duration: parseInt(e.target.value)})}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  min="1"
                  max="365"
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={addReminder}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  Create Reminder
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Reminders */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Bell className="w-6 h-6 mr-2" />
            Active Reminders
          </h3>
          
          {reminders.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">No active reminders</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reminders.map((reminder, index) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{reminder.medicineName}</h4>
                      <p className="text-gray-300">{reminder.dosage}</p>
                    </div>
                    <Button
                      onClick={() => deleteReminder(reminder.id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-teal-400">
                      <Clock className="w-4 h-4 mr-1" />
                      {reminder.times.join(', ')}
                    </div>
                    <div className="text-gray-400">
                      {reminder.days.length === 7 ? 'Daily' : reminder.days.join(', ')}
                    </div>
                    <div className="text-gray-400">
                      {reminder.duration} days remaining
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Tips */}
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Medicine Tips</h3>
          <div className="space-y-2 text-gray-300 text-sm">
            <p>• Take medicines with food if recommended by your doctor</p>
            <p>• Set multiple alarms for critical medications</p>
            <p>• Keep a backup supply when traveling</p>
            <p>• Store medicines in a cool, dry place</p>
            <p>• Never share prescription medications</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MedicineReminder;
