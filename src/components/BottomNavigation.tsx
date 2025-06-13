import React from 'react';
import { motion } from 'framer-motion';
import { Home, Heart, Activity, Shield, Bot } from 'lucide-react';
interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}
const BottomNavigation = ({
  activeTab,
  onTabChange
}: BottomNavigationProps) => {
  const tabs = [{
    id: 'dashboard',
    icon: Home,
    label: 'Home'
  }, {
    id: 'health',
    icon: Heart,
    label: 'Health'
  }, {
    id: 'bro-ai',
    icon: Bot,
    label: 'Bro AI',
    special: true
  }, {
    id: 'fitness',
    icon: Activity,
    label: 'Fitness'
  }, {
    id: 'safety',
    icon: Shield,
    label: 'Safety'
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-3 px-4">
        {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        if (tab.special) {
          return <motion.button key={tab.id} onClick={() => onTabChange(tab.id)} className="relative" whileTap={{
            scale: 0.95
          }}>
                <motion.div className="w-14 h-14 bg-gradient-to-r from-safefit-primary to-safefit-highlight rounded-full flex items-center justify-center shadow-lg" animate={{
              scale: isActive ? 1.1 : 1
            }} transition={{
              duration: 0.2
            }}>
                  <Icon className="w-7 h-7 text-white" />
                </motion.div>
                
              </motion.button>;
        }
        return <motion.button key={tab.id} onClick={() => onTabChange(tab.id)} className="flex flex-col items-center py-2 px-3 rounded-lg min-w-0" whileTap={{
          scale: 0.95
        }}>
              <motion.div animate={{
            color: isActive ? '#065A82' : '#6B7280',
            scale: isActive ? 1.1 : 1
          }} transition={{
            duration: 0.2
          }}>
                <Icon size={22} />
              </motion.div>
              <motion.span animate={{
            color: isActive ? '#065A82' : '#6B7280',
            fontSize: isActive ? '12px' : '11px'
          }} transition={{
            duration: 0.2
          }} className="mt-1 font-medium">
                {tab.label}
              </motion.span>
              {isActive && <motion.div layoutId="activeTab" className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-safefit-highlight rounded-full" />}
            </motion.button>;
      })}
      </div>
    </div>;
};
export default BottomNavigation;