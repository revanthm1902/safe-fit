
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
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
  user: User;
}

const MainApp = ({ user }: MainAppProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSettingsToggle = () => {
    console.log('Settings toggle clicked, current state:', showSettings);
    setShowSettings(!showSettings);
  };

  const handleRefresh = () => {
    console.log('Refreshing current tab:', activeTab);
    setRefreshKey(prev => prev + 1);
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
        return <Dashboard key={refreshKey} user={user} />;
      case 'health':
        return <Health key={refreshKey} />;
      case 'fitness':
        return <Fitness key={refreshKey} />;
      case 'safety':
        return <Safety key={refreshKey} />;
      case 'bro-ai':
        return <BroAI key={refreshKey} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <BrandHeader onSettingsClick={handleSettingsToggle} onRefresh={handleRefresh} />
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
