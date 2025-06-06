
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, MapPin, PhoneCall, Bell, Radio, ShieldCheck, Lock } from 'lucide-react';
import EmergencyContactManager from './EmergencyContactManager';

const Safety = () => {
  return (
    <div className="min-h-screen bg-white p-4 pt-20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-safefit-dark mb-2">Safety</h1>
        <p className="text-gray-600">Your protection is our priority</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-3 rounded-full mr-4">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-safefit-dark">SOS Emergency</h3>
              <p className="text-gray-600 text-sm">Quickly alert your emergency contacts</p>
            </div>
          </div>
          <Button 
            className="w-full bg-red-500 hover:bg-red-600 text-white"
            onClick={() => {
              alert("SOS Triggered! In a real app, this would send alerts to your emergency contacts.");
            }}
          >
            Activate SOS
          </Button>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card className="p-6 border border-gray-200 bg-white">
          <h3 className="text-lg font-bold text-safefit-dark mb-4">Safety Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: MapPin, title: "Location Sharing", description: "Share your location in real-time" },
              { icon: PhoneCall, title: "Emergency Call", description: "Quick-dial emergency services" },
              { icon: Bell, title: "Safety Alerts", description: "Get notified of nearby incidents" },
              { icon: Radio, title: "Siren Alarm", description: "Loud alarm to deter threats" }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="p-4 border border-gray-200 hover:border-safefit-highlight hover:shadow-sm transition-all cursor-pointer bg-white">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-full">
                        <Icon className="h-5 w-5 text-safefit-highlight" />
                      </div>
                      <div>
                        <h4 className="font-medium text-safefit-dark">{item.title}</h4>
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
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 p-1 rounded-full mt-1">
                <Lock className="h-4 w-4 text-safefit-highlight" />
              </div>
              <div>
                <h4 className="font-medium text-safefit-dark text-sm">Stay Aware of Surroundings</h4>
                <p className="text-xs text-gray-600">Always be conscious of your environment, especially in unfamiliar areas.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 p-1 rounded-full mt-1">
                <Lock className="h-4 w-4 text-safefit-highlight" />
              </div>
              <div>
                <h4 className="font-medium text-safefit-dark text-sm">Keep Emergency Contacts Updated</h4>
                <p className="text-xs text-gray-600">Regularly check and update your emergency contacts in the app.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-gray-100 p-1 rounded-full mt-1">
                <Lock className="h-4 w-4 text-safefit-highlight" />
              </div>
              <div>
                <h4 className="font-medium text-safefit-dark text-sm">Test SOS Features Monthly</h4>
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
