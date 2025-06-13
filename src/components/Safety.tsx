
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, PhoneCall, Bell, Radio, ShieldCheck, Lock, Navigation } from 'lucide-react';
import EmergencyContactManager from './EmergencyContactManager';
import LiveLocationMap from './LiveLocationMap';

const Safety = () => {
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const handleSOSActivation = () => {
    setSosActive(true);
    setSosCountdown(3);
    
    const countdown = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          // Send SOS alert
          sendSOSAlert();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const sendSOSAlert = () => {
    // Simulate sending SOS alert
    console.log('SOS Alert sent to emergency contacts with location:', userLocation);
    setTimeout(() => {
      setSosActive(false);
      alert("SOS Alert sent! Emergency contacts have been notified with your location.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white p-4 pt-20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-safefit-dark mb-2">Safety Center</h1>
        <p className="text-gray-600">Your protection is our priority</p>
      </motion.div>

      {/* SOS Emergency Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex justify-center"
      >
        <div className="relative">
          <Button 
            className={`w-32 h-32 rounded-full text-white text-xl font-bold shadow-lg transition-all duration-300 ${
              sosActive 
                ? 'bg-red-600 animate-pulse scale-110' 
                : 'bg-red-500 hover:bg-red-600 hover:scale-105'
            }`}
            onClick={handleSOSActivation}
            disabled={sosActive}
          >
            {sosActive ? (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold">{sosCountdown}</span>
                <span className="text-sm">Sending...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <AlertCircle className="h-8 w-8 mb-1" />
                <span>SOS</span>
              </div>
            )}
          </Button>
          {sosActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
            >
              <p className="text-sm text-red-600 font-medium">
                Location sent to emergency contacts
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Live Location Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card className="p-6 border border-gray-200 bg-white">
          <div className="flex items-center mb-4">
            <Navigation className="h-6 w-6 text-safefit-highlight mr-3" />
            <h3 className="text-lg font-bold text-safefit-dark">Live Location Tracking</h3>
          </div>
          <LiveLocationMap userLocation={userLocation} />
        </Card>
      </motion.div>

      {/* Safety Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <Card className="p-6 border border-gray-200 bg-white">
          <h3 className="text-lg font-bold text-safefit-dark mb-6">Safety Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { 
                icon: MapPin, 
                title: "Location Sharing", 
                description: "Share your location in real-time",
                color: "from-blue-500 to-blue-600"
              },
              { 
                icon: PhoneCall, 
                title: "Emergency Call", 
                description: "Quick-dial emergency services",
                color: "from-green-500 to-green-600"
              },
              { 
                icon: Bell, 
                title: "Safety Alerts", 
                description: "Get notified of nearby incidents",
                color: "from-yellow-500 to-orange-500"
              },
              { 
                icon: Radio, 
                title: "Siren Alarm", 
                description: "Loud alarm to deter threats",
                color: "from-purple-500 to-purple-600"
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (index * 0.1) }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-4 border border-gray-200 hover:border-safefit-highlight hover:shadow-md transition-all cursor-pointer bg-white h-full">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`bg-gradient-to-r ${item.color} p-3 rounded-full`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-safefit-dark mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Emergency Contacts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <Card className="p-6 border border-gray-200 bg-white">
          <EmergencyContactManager />
        </Card>
      </motion.div>

      {/* Safety Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="p-6 border border-gray-200 bg-white">
          <div className="flex items-center mb-4">
            <ShieldCheck className="h-6 w-6 text-safefit-highlight mr-3" />
            <h3 className="text-lg font-bold text-safefit-dark">Safety Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="bg-safefit-highlight/10 p-2 rounded-full mt-1">
                <Lock className="h-4 w-4 text-safefit-highlight" />
              </div>
              <div>
                <h4 className="font-medium text-safefit-dark text-sm mb-1">Stay Aware</h4>
                <p className="text-xs text-gray-600">Always be conscious of your environment, especially in unfamiliar areas.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="bg-safefit-highlight/10 p-2 rounded-full mt-1">
                <Lock className="h-4 w-4 text-safefit-highlight" />
              </div>
              <div>
                <h4 className="font-medium text-safefit-dark text-sm mb-1">Update Contacts</h4>
                <p className="text-xs text-gray-600">Regularly check and update your emergency contacts in the app.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <div className="bg-safefit-highlight/10 p-2 rounded-full mt-1">
                <Lock className="h-4 w-4 text-safefit-highlight" />
              </div>
              <div>
                <h4 className="font-medium text-safefit-dark text-sm mb-1">Test Features</h4>
                <p className="text-xs text-gray-600">Regularly test the SOS feature to ensure it works when needed.</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Safety;
