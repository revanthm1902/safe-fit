import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import SplashScreen from '../components/SplashScreen';
import AuthScreen from '../components/AuthScreen';
import ProfileForm from '../components/ProfileForm';
import OnboardingScreen from '../components/OnboardingScreen';
import SubscriptionPage from '../components/SubscriptionPage';
import MainApp from '../components/MainApp';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';

interface UserWithProfile extends User {
  profile?: {
    full_name?: string;
    phone?: string;
  };
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'profile' | 'onboarding' | 'subscription' | 'main'>('splash');
  const [user, setUser] = useState<UserWithProfile | null>(null);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_OUT') {
        setCurrentScreen('auth');
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleExistingUser = async (authUser: User) => {
    // Check localStorage first for quick access
    const cachedProfile = localStorage.getItem(`profile_${authUser.id}`);
    
    if (cachedProfile) {
      try {
        const profile = JSON.parse(cachedProfile);
        const hasProfile = profile && profile.full_name && profile.phone;
        
        if (hasProfile) {
          // Profile exists, check onboarding
          const hasSeenOnboarding = localStorage.getItem(`onboarding_${authUser.id}`);
          setUser({ ...authUser, profile });
          
          if (!hasSeenOnboarding) {
            setCurrentScreen('onboarding');
          } else {
            // Check subscription
            const userSubscription = localStorage.getItem(`subscription_${authUser.id}`);
            if (!userSubscription) {
              setCurrentScreen('subscription');
            } else {
              setCurrentScreen('main');
            }
          }
          return;
        }
      } catch (e) {
        console.error('Error parsing cached profile:', e);
      }
    }

    // Fallback to Supabase check
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
      // Cache the profile
      localStorage.setItem(`profile_${authUser.id}`, JSON.stringify(profile));
      
      // Check if they've seen onboarding
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${authUser.id}`);
      setUser({ ...authUser, profile });
      
      if (!hasSeenOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        // Check if they have an active subscription
        const userSubscription = localStorage.getItem(`subscription_${authUser.id}`);
        if (!userSubscription) {
          setCurrentScreen('subscription');
        } else {
          setCurrentScreen('main');
        }
      }
    }
  };

  const handleAuthSuccess = async (userData: { user: User; hasProfile: boolean }) => {
    setUser(userData.user);
    
    if (userData.hasProfile) {
      // Check onboarding and subscription status
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${userData.user.id}`);
      
      if (!hasSeenOnboarding) {
        setCurrentScreen('onboarding');
      } else {
        const userSubscription = localStorage.getItem(`subscription_${userData.user.id}`);
        if (!userSubscription) {
          setCurrentScreen('subscription');
        } else {
          setCurrentScreen('main');
        }
      }
    } else {
      setCurrentScreen('profile');
    }
  };

  const handleProfileComplete = async () => {
    if (!user) return;

    // Refetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setUser({ ...user, profile } as UserWithProfile);
    setCurrentScreen('onboarding');
  };

  const handleOnboardingComplete = () => {
    if (!user) return;

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
    if (!user) return;

    localStorage.setItem(`subscription_${user.id}`, 'true');
    setCurrentScreen('main');
  };

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-safefit-white">
        {currentScreen === 'splash' && <SplashScreen />}
        {currentScreen === 'auth' && <AuthScreen onAuthSuccess={handleAuthSuccess} />}
        {currentScreen === 'profile' && user && <ProfileForm user={user} onComplete={handleProfileComplete} />}
        {currentScreen === 'onboarding' && <OnboardingScreen onComplete={handleOnboardingComplete} />}
        {currentScreen === 'subscription' && <SubscriptionPage onComplete={handleSubscriptionComplete} />}
        {currentScreen === 'main' && user && <MainApp user={user} />}
      </div>
    </SubscriptionProvider>
  );
};

export default Index;
