
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, Activity, Shield, Bot } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'health', icon: Heart, label: 'Health' },
    { id: 'bro-ai', icon: Bot, label: 'Bro AI', special: true },
    { id: 'fitness', icon: Activity, label: 'Fitness' },
    { id: 'safety', icon: Shield, label: 'Safety' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-safefit-dark/95 backdrop-blur-lg border-t border-safefit-border/30">
      <div className="flex justify-around items-center py-2 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          if (tab.special) {
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative"
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-safefit-primary to-safefit-highlight rounded-full flex items-center justify-center pulse-glow"
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon className="w-8 h-8 text-white" />
                </motion.div>
                <span className="text-xs text-safefit-highlight mt-1 font-poppins font-medium">
                  {tab.label}
                </span>
              </motion.button>
            );
          }
          
          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center py-2 px-3 rounded-lg min-w-0"
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{
                  color: isActive ? '#a1c6ea' : '#507dbc',
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <Icon size={20} />
              </motion.div>
              <motion.span
                animate={{
                  color: isActive ? '#a1c6ea' : '#507dbc',
                  fontSize: isActive ? '12px' : '10px',
                }}
                transition={{ duration: 0.2 }}
                className="mt-1 font-medium font-poppins"
              >
                {tab.label}
              </motion.span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-safefit-highlight rounded-full"
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
