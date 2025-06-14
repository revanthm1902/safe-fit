
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Shield, Truck, Flame, Heart, Building, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmergencyService {
  name: string;
  number: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const NationalEmergencyContacts = () => {
  const emergencyServices: EmergencyService[] = [
    {
      name: "Police",
      number: "911",
      description: "Police Emergency Services",
      icon: Shield,
      color: "from-blue-600 to-blue-700"
    },
    {
      name: "Fire Department",
      number: "911",
      description: "Fire Emergency & Rescue",
      icon: Flame,
      color: "from-red-600 to-red-700"
    },
    {
      name: "Medical Emergency",
      number: "911",
      description: "Ambulance & Medical",
      icon: Heart,
      color: "from-green-600 to-green-700"
    },
    {
      name: "Poison Control",
      number: "1-800-222-1222",
      description: "Poison Control Center",
      icon: AlertTriangle,
      color: "from-orange-600 to-orange-700"
    },
    {
      name: "National Suicide Prevention",
      number: "988",
      description: "Crisis & Mental Health",
      icon: Heart,
      color: "from-purple-600 to-purple-700"
    },
    {
      name: "Child Abuse Hotline",
      number: "1-800-4-A-CHILD",
      description: "Child Protection Services",
      icon: Shield,
      color: "from-pink-600 to-pink-700"
    }
  ];

  const handleCall = (number: string, name: string) => {
    // Clean the number for tel: protocol
    const cleanNumber = number.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
    console.log(`Calling ${name} at ${number}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 mb-6">
        <Building className="h-6 w-6 text-safefit-highlight" />
        <h3 className="text-xl font-bold text-safefit-dark">National Emergency Contacts</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {emergencyServices.map((service, index) => {
          const Icon = service.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 bg-white border border-gray-200 hover:border-safefit-highlight/50 hover:shadow-md transition-all h-full">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                        <Icon className="text-white h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-safefit-dark text-sm">{service.name}</h4>
                        <p className="text-xs text-gray-600">{service.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-mono text-gray-700">{service.number}</span>
                    </div>
                    <Button
                      onClick={() => handleCall(service.number, service.name)}
                      size="sm"
                      className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 text-sm">Emergency Contact Information</h4>
            <p className="text-xs text-blue-700 mt-1">
              These are official national emergency contact numbers. In life-threatening situations, always call 911 first.
              Keep these numbers accessible and share them with family members.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NationalEmergencyContacts;
