
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from './BottomNavigation';
import Dashboard from './Dashboard';
import Health from './Health';
import Fitness from './Fitness';
import Safety from './Safety';
import Settings from './Settings';

interface MainAppProps {
  user: any;
}

const MainApp = ({ user }: MainAppProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'health':
        return <Health user={user} />;
      case 'fitness':
        return <Fitness user={user} />;
      case 'safety':
        return <Safety user={user} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {renderActiveScreen()}
      </motion.div>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default MainApp;
