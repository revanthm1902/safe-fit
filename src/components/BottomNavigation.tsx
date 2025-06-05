
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, Activity, Shield, Settings } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'health', icon: Heart, label: 'Health' },
    { id: 'fitness', icon: Activity, label: 'Fitness' },
    { id: 'safety', icon: Shield, label: 'Safety' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/20 backdrop-blur-lg border-t border-white/10">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center py-2 px-3 rounded-lg"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  color: isActive ? '#2dd4bf' : '#9ca3af',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={24} />
              </motion.div>
              <motion.span
                animate={{
                  color: isActive ? '#2dd4bf' : '#9ca3af',
                  fontSize: isActive ? '12px' : '11px',
                }}
                transition={{ duration: 0.2 }}
                className="mt-1 font-medium"
              >
                {tab.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-teal-400 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
