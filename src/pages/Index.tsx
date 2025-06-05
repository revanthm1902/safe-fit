
import React, { useState, useEffect } from 'react';
import SplashScreen from '../components/SplashScreen';
import AuthScreen from '../components/AuthScreen';
import OnboardingScreen from '../components/OnboardingScreen';
import MainApp from '../components/MainApp';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'onboarding' | 'main'>('splash');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate splash screen timing
    const timer = setTimeout(() => {
      setCurrentScreen('auth');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentScreen('main');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} />}
      {currentScreen === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
      {currentScreen === 'main' && <MainApp user={user} />}
    </div>
  );
};

export default Index;
