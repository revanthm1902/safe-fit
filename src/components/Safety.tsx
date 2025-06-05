
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Phone, MapPin, Users, Bell, Zap } from 'lucide-react';

const Safety = () => {
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);

  const triggerSOS = () => {
    setSosActive(true);
    setSosCountdown(5);
    
    const interval = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Here would be the actual SOS trigger
          console.log('SOS Alert Sent!');
          setSosActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosCountdown(0);
  };

  const safetyFeatures = [
    {
      icon: Shield,
      title: "Fall Detection",
      status: "Active",
      description: "Monitoring for sudden falls",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: MapPin,
      title: "Location Sharing",
      status: "On",
      description: "Sharing with 3 contacts",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Bell,
      title: "Alert System",
      status: "Ready",
      description: "All systems operational",
      color: "from-purple-500 to-violet-500"
    },
    {
      icon: Users,
      title: "Emergency Contacts",
      status: "3 Added",
      description: "Mom, Dad, Sarah",
      color: "from-teal-500 to-cyan-500"
    }
  ];

  const recentAlerts = [
    { time: "2 hours ago", type: "Location Check", status: "Safe" },
    { time: "Yesterday", type: "Fall Detection", status: "False Alarm" },
    { time: "3 days ago", type: "Emergency Contact", status: "Delivered" }
  ];

  return (
    <div className="p-4 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Safety Center</h1>
        <p className="text-gray-300">Your personal safety and emergency features</p>
      </motion.div>

      {sosActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <Alert className="bg-red-500/20 border-red-500 text-white">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>SOS Alert will be sent in {sosCountdown} seconds</span>
                <Button onClick={cancelSOS} size="sm" variant="outline" className="text-red-400 border-red-400">
                  Cancel
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="p-8 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-lg border border-red-500/30 text-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={triggerSOS}
              disabled={sosActive}
              className="w-32 h-32 rounded-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-xl shadow-lg"
            >
              {sosActive ? (
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto mb-1" />
                  <div>{sosCountdown}</div>
                </div>
              ) : (
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-1" />
                  <div>SOS</div>
                </div>
              )}
            </Button>
          </motion.div>
          <h3 className="text-2xl font-bold text-white mt-4 mb-2">Emergency SOS</h3>
          <p className="text-gray-300">Press and hold to alert emergency contacts</p>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {safetyFeatures.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${feature.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                    {feature.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentAlerts.map((alert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.7 }}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{alert.type}</p>
                  <p className="text-gray-400 text-sm">{alert.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  alert.status === 'Safe' || alert.status === 'Delivered' 
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {alert.status}
                </span>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Safety;
