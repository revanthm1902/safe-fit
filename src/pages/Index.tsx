
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import SplashScreen from '../components/SplashScreen';
import AuthScreen from '../components/AuthScreen';
import ProfileForm from '../components/ProfileForm';
import OnboardingScreen from '../components/OnboardingScreen';
import SubscriptionPage from '../components/SubscriptionPage';
import MainApp from '../components/MainApp';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'profile' | 'onboarding' | 'subscription' | 'main'>('splash');
  const [user, setUser] = useState(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await handleExistingUser(session.user);
      } else {
        // Simulate splash screen timing
        setTimeout(() => {
          setCurrentScreen('auth');
        }, 3000);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setCurrentScreen('auth');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExistingUser = async (authUser: any) => {
    // Check if user has completed profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    const hasProfile = profile && profile.full_name && profile.phone;
    
    if (!hasProfile) {
      setUser(authUser);
      setCurrentScreen('profile');
    } else {
      // Check if they've seen onboarding
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${authUser.id}`);
      setUser({ ...authUser, profile });
      
      // Check if they have an active subscription
      const userSubscription = localStorage.getItem(`subscription_${authUser.id}`);
      setHasSubscription(!!userSubscription);
      
      if (!hasSeenOnboarding) {
        setCurrentScreen('onboarding');
      } else if (!userSubscription) {
        setCurrentScreen('subscription');
      } else {
        setCurrentScreen('main');
      }
    }
  };

  const handleAuthSuccess = async (userData: any) => {
    setUser(userData.user);
    
    if (userData.hasProfile) {
      // Check onboarding and subscription status
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${userData.user.id}`);
      const userSubscription = localStorage.getItem(`subscription_${userData.user.id}`);
      setHasSubscription(!!userSubscription);
      
      if (!hasSeenOnboarding) {
        setCurrentScreen('onboarding');
      } else if (!userSubscription) {
        setCurrentScreen('subscription');
      } else {
        setCurrentScreen('main');
      }
    } else {
      setCurrentScreen('profile');
    }
  };

  const handleProfileComplete = async () => {
    // Refetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setUser({ ...user, profile });
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem(`onboarding_${user.id}`, 'true');
    
    // Check if they have a subscription
    const userSubscription = localStorage.getItem(`subscription_${user.id}`);
    
    if (!userSubscription) {
      setCurrentScreen('subscription');
    } else {
      setCurrentScreen('main');
    }
  };

  const handleSubscriptionComplete = () => {
    localStorage.setItem(`subscription_${user.id}`, 'true');
    setHasSubscription(true);
    setCurrentScreen('main');
  };

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-safefit-white">
        {currentScreen === 'splash' && <SplashScreen />}
        {currentScreen === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} />}
        {currentScreen === 'profile' && <ProfileForm user={user} onComplete={handleProfileComplete} />}
        {currentScreen === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
        {currentScreen === 'subscription' && <SubscriptionPage onComplete={handleSubscriptionComplete} />}
        {currentScreen === 'main' && <MainApp user={user} />}
      </div>
    </SubscriptionProvider>
  );
};

export default Index;
