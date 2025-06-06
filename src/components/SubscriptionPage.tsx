
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Crown, Shield, Activity } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SubscriptionPageProps {
  onComplete: () => void;
}

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onComplete }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { setSubscription } = useSubscription();
  const { toast } = useToast();

  const subscriptionPlans = [
    {
      id: 'basic',
      title: '3 Months',
      price: '₹999',
      icon: Shield,
      features: [
        'Health Tracking',
        'Basic Safety Features',
        'Emergency SOS',
        'Community Support'
      ],
      color: 'from-safefit-primary to-safefit-highlight'
    },
    {
      id: 'premium',
      title: '12 Months',
      price: '₹3650',
      icon: Crown,
      features: [
        'All Basic Features',
        'Advanced Fitness Analytics',
        'AI Health Assistant',
        'Premium Support',
        'Family Safety Sharing'
      ],
      recommended: true,
      color: 'from-safefit-highlight to-safefit-card'
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(true);
    setSelectedPlan(planId);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Set subscription in context - in real app this would come from backend
    const endDate = new Date();
    if (planId === 'basic') {
      endDate.setMonth(endDate.getMonth() + 3);
      setSubscription(true, 'basic', endDate);
    } else {
      endDate.setMonth(endDate.getMonth() + 12);
      setSubscription(true, 'premium', endDate);
    }
    
    toast({
      title: "Subscription activated",
      description: `Your ${planId} plan is now active`,
    });
    
    setLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-safefit-white p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-4 text-safefit-dark">Choose Your Plan to Activate SafeFit</h1>
          <p className="text-safefit-primary">Select the plan that fits your needs and start your health journey today</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {subscriptionPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <Card className={`p-6 border ${plan.recommended ? 'border-safefit-highlight ring-2 ring-safefit-highlight/30' : 'border-safefit-border'}`}>
                <div className="relative">
                  {plan.recommended && (
                    <span className="absolute -top-4 right-0 bg-safefit-highlight text-white text-xs px-3 py-1 rounded-full">
                      Best Value
                    </span>
                  )}

                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`p-3 rounded-full bg-gradient-to-r ${plan.color} text-white`}>
                      <plan.icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-safefit-dark">{plan.title}</h3>
                      <p className="text-safefit-primary text-sm">SafeFit {plan.id.charAt(0).toUpperCase() + plan.id.slice(1)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-safefit-dark">{plan.price}</span>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-safefit-primary">
                        <Check size={18} className="mr-2 text-safefit-highlight" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading}
                    variant="default"
                    className={`w-full ${plan.recommended ? 'bg-safefit-highlight hover:bg-safefit-highlight/90' : 'bg-safefit-primary hover:bg-safefit-primary/90'}`}
                  >
                    {loading && selectedPlan === plan.id ? (
                      <>
                        <span className="animate-spin mr-2">
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                        Processing...
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-6"
          >
            <h3 className="text-lg font-medium text-safefit-dark mb-2">Processing Payment...</h3>
            <div className="flex justify-center">
              <Activity size={28} className="text-safefit-highlight animate-pulse" />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;
