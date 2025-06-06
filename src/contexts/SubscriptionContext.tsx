
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'basic' | 'premium';

interface SubscriptionContextType {
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  subscriptionEndDate: Date | null;
  setSubscription: (isSubscribed: boolean, tier: SubscriptionTier, endDate: Date | null) => void;
  checkFeatureAccess: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('free');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);

  const setSubscription = (isSubscribed: boolean, tier: SubscriptionTier, endDate: Date | null) => {
    setIsSubscribed(isSubscribed);
    setSubscriptionTier(tier);
    setSubscriptionEndDate(endDate);
  };

  const checkFeatureAccess = (feature: string): boolean => {
    // If not subscribed, block premium features
    if (!isSubscribed) return false;

    // Basic tier features
    const basicFeatures = ['dashboard', 'health-basic', 'sos-basic'];
    
    // Premium tier features (includes all basic features plus premium ones)
    const premiumFeatures = [
      ...basicFeatures, 
      'health-advanced', 
      'fitness-advanced', 
      'sos-advanced', 
      'ai-assistant',
      'emergency-contacts'
    ];
    
    if (subscriptionTier === 'premium') {
      return premiumFeatures.includes(feature);
    } else if (subscriptionTier === 'basic') {
      return basicFeatures.includes(feature);
    }
    
    return false;
  };

  return (
    <SubscriptionContext.Provider value={{ 
      isSubscribed, 
      subscriptionTier, 
      subscriptionEndDate, 
      setSubscription, 
      checkFeatureAccess 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
