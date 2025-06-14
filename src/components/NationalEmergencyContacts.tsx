import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Shield, Truck, Flame, Heart, Building, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface EmergencyService {
  name: string;
  number: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}
const NationalEmergencyContacts = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const emergencyServices: EmergencyService[] = [{
    name: "Police",
    number: "100",
    description: "Police Emergency Services",
    icon: Shield,
    color: "from-blue-600 to-blue-700"
  }, {
    name: "Fire Department",
    number: "101",
    description: "Fire Emergency & Rescue",
    icon: Flame,
    color: "from-red-600 to-red-700"
  }, {
    name: "Medical Emergency",
    number: "108",
    description: "Ambulance & Medical",
    icon: Heart,
    color: "from-green-600 to-green-700"
  }, {
    name: "Disaster Management",
    number: "108",
    description: "National Disaster Response",
    icon: AlertTriangle,
    color: "from-orange-600 to-orange-700"
  }, {
    name: "Women Helpline",
    number: "1091",
    description: "Women Safety & Support",
    icon: Shield,
    color: "from-purple-600 to-purple-700"
  }, {
    name: "Child Helpline",
    number: "1098",
    description: "Child Protection Services",
    icon: Heart,
    color: "from-pink-600 to-pink-700"
  }, {
    name: "Tourist Emergency",
    number: "1363",
    description: "Tourist Support Services",
    icon: Building,
    color: "from-indigo-600 to-indigo-700"
  }, {
    name: "Senior Citizens",
    number: "14567",
    description: "Elder Care Helpline",
    icon: Heart,
    color: "from-teal-600 to-teal-700"
  }];
  const handleCall = (number: string, name: string) => {
    // Clean the number for tel: protocol
    const cleanNumber = number.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanNumber}`;
    console.log(`Calling ${name} at ${number}`);
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building className="h-6 w-6 text-safefit-highlight" />
          <h3 className="text-xl font-bold text-safefit-dark">National Emergency Contacts</h3>
        </div>
        <Button onClick={() => setIsExpanded(!isExpanded)} variant="outline" size="sm" className="flex items-center space-x-2">
          <span>Emergency</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <AnimatePresence>
        {isExpanded && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} transition={{
        duration: 0.3
      }} className="overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {emergencyServices.map((service, index) => {
            const Icon = service.icon;
            return <motion.div key={index} initial={{
              opacity: 0,
              y: 10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }}>
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
                          <Button onClick={() => handleCall(service.number, service.name)} size="sm" className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>;
          })}
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200 mt-6">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 text-sm">Indian Emergency Contact Information</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    These are official Indian national emergency contact numbers. In life-threatening situations, always call 100 (Police), 101 (Fire), or 108 (Medical) first.
                    Keep these numbers accessible and share them with family members.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>}
      </AnimatePresence>
    </div>;
};
export default NationalEmergencyContacts;