
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BrandHeader from './BrandHeader';
import BottomNavigation from './BottomNavigation';
import Dashboard from './Dashboard';
import Health from './Health';
import Fitness from './Fitness';
import Safety from './Safety';
import Settings from './Settings';
import BroAI from './BroAI';
import SecurityPasskey from './SecurityPasskey';

interface MainAppProps {
  user: any;
}

const MainApp = ({ user }: MainAppProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);

  const handleSettingsToggle = () => {
    console.log('Settings toggle clicked, current state:', showSettings);
    setShowSettings(!showSettings);
  };

  const handlePasskeyVerified = () => {
    setIsPasskeyVerified(true);
  };

  if (!isPasskeyVerified) {
    return <SecurityPasskey user={user} onPasskeyVerified={handlePasskeyVerified} />;
  }

  const renderActiveScreen = () => {
    if (showSettings) {
      return <Settings user={user} onBack={handleSettingsToggle} />;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'health':
        return <Health />;
      case 'fitness':
        return <Fitness />;
      case 'safety':
        return <Safety />;
      case 'bro-ai':
        return <BroAI />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <BrandHeader onSettingsClick={handleSettingsToggle} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen pt-16"
      >
        {renderActiveScreen()}
      </motion.div>
      {!showSettings && (
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
};

export default MainApp;
