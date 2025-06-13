import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, Bell, Shield, Palette, Download, LogOut, ChevronRight,
  CreditCard, HelpCircle, Lock, FileText, ArrowLeft
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface SettingsProps {
  user: any;
  onBack?: () => void;
}

const Settings = ({ user, onBack }: SettingsProps) => {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [fallDetection, setFallDetection] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    address: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [supportData, setSupportData] = useState({
    issue: '',
    description: ''
  });
  
  const { toast } = useToast();
  const { isSubscribed, subscriptionTier, subscriptionEndDate } = useSubscription();

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        phone: userProfile.phone || '',
        gender: userProfile.gender || '',
        date_of_birth: userProfile.date_of_birth ? new Date(userProfile.date_of_birth).toISOString().split('T')[0] : '',
        address: userProfile.address || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      // For demo, we'll create mock data
      const mockProfile = {
        id: user.id,
        full_name: 'Jane Doe',
        phone: '+91 98765 43210',
        gender: 'Female',
        date_of_birth: '1992-08-15',
        address: '123 Health Street, Wellness City',
        user_id: user.id
      };
      
      setUserProfile(mockProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      
      // Clear local storage
      localStorage.clear();
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Supabase sign out error:', error);
        throw error;
      }
      
      console.log('Successfully signed out from Supabase');
      
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
      
      // Force page reload to reset app state
      window.location.href = '/';
      
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const exportHealthData = async () => {
    try {
      // Mock data export
      const mockData = [
        {
          id: '1',
          type: 'heart_rate',
          value: 72,
          unit: 'bpm',
          recorded_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'blood_oxygen',
          value: 98,
          unit: '%',
          recorded_at: new Date().toISOString()
        }
      ];

      const dataStr = JSON.stringify(mockData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `safefit_health_data_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();

      toast({
        title: "Data exported successfully",
        description: "Your health data has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePersonalInfoSubmit = () => {
    // Mock update profile
    setUserProfile({
      ...userProfile,
      ...formData
    });
    
    toast({
      title: "Profile updated",
      description: "Your personal information has been updated successfully."
    });
    
    setIsPersonalInfoOpen(false);
  };

  const handlePasswordChange = () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive"
      });
      return;
    }
    
    // Mock password change
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully."
    });
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setIsPasswordOpen(false);
  };

  const handleSupportSubmit = () => {
    // Mock support ticket submission
    toast({
      title: "Support request sent",
      description: "We've received your request and will get back to you soon."
    });
    
    setSupportData({
      issue: '',
      description: ''
    });
    
    setIsSupportOpen(false);
  };

  const settingsGroups = [
    {
      title: "Profile",
      items: [
        { 
          icon: User, 
          label: "Personal Information", 
          action: () => setIsPersonalInfoOpen(true) 
        },
        { 
          icon: Lock, 
          label: "Change Password", 
          action: () => setIsPasswordOpen(true) 
        },
        { 
          icon: Shield, 
          label: "Privacy & Security", 
          action: () => console.log('Privacy') 
        },
        {
          icon: FileText,
          label: "Terms & Conditions",
          action: () => setIsTermsOpen(true)
        }
      ]
    },
    {
      title: "Preferences",
      items: [
        { icon: Bell, label: "Notifications", toggle: notifications, onToggle: setNotifications },
        { icon: Shield, label: "Location Sharing", toggle: locationSharing, onToggle: setLocationSharing },
        { icon: Shield, label: "Fall Detection", toggle: fallDetection, onToggle: setFallDetection }
      ]
    },
    {
      title: "Subscription",
      items: [
        { 
          icon: CreditCard, 
          label: "Manage Plan", 
          action: () => console.log('Subscription'), 
          info: isSubscribed ? `${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan` : "Free Plan" 
        }
      ]
    },
    {
      title: "Support",
      items: [
        { 
          icon: HelpCircle, 
          label: "Help & Support", 
          action: () => setIsSupportOpen(true) 
        },
        { icon: Download, label: "Export Health Data", action: exportHealthData }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-safefit-white">
      <div className="p-4 pt-6 pb-20">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-4 text-safefit-primary hover:text-safefit-highlight hover:bg-safefit-light"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-safefit-dark mb-2">Settings</h1>
          <p className="text-safefit-primary">Customize your SafeFit experience</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="p-6 bg-white border border-safefit-border shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-safefit-highlight to-safefit-card rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-safefit-dark">
                  {userProfile?.full_name || 'User'}
                </h3>
                <p className="text-safefit-primary">{user?.email || 'user@example.com'}</p>
                <p className="text-safefit-highlight text-sm">
                  {isSubscribed ? `${subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Member` : 'Free Plan'}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (groupIndex + 1) * 0.1 }}
            className="mb-6"
          >
            <Card className="p-6 bg-white border border-safefit-border shadow-sm">
              <h3 className="text-lg font-bold text-safefit-dark mb-4">{group.title}</h3>
              <div className="space-y-4">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div key={itemIndex}>
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5 text-safefit-primary" />
                          <span className="text-safefit-dark font-medium">{item.label}</span>
                        </div>
                        {item.toggle !== undefined ? (
                          <Switch
                            checked={item.toggle}
                            onCheckedChange={item.onToggle}
                            className="data-[state=checked]:bg-safefit-highlight"
                          />
                        ) : item.info ? (
                          <div className="flex items-center">
                            <span className="mr-2 text-sm text-safefit-primary">
                              {item.info}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={item.action}
                              className="text-safefit-primary hover:text-safefit-highlight hover:bg-safefit-light"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={item.action}
                            className="text-safefit-primary hover:text-safefit-highlight hover:bg-safefit-light"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {itemIndex < group.items.length - 1 && (
                        <Separator className="bg-safefit-border/50" />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="w-full border-red-500/50 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-500"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <p className="text-safefit-primary text-sm">SafeFit v1.0.0</p>
          <p className="text-safefit-primary/70 text-xs mt-1">Your health and safety companion</p>
        </motion.div>
      </div>

      {/* Personal Information Dialog */}
      <Dialog open={isPersonalInfoOpen} onOpenChange={setIsPersonalInfoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personal Information</DialogTitle>
            <DialogDescription>
              Update your personal details below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-of-birth">Date of Birth</Label>
                <Input
                  id="date-of-birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPersonalInfoOpen(false)}>Cancel</Button>
            <Button 
              className="bg-safefit-highlight hover:bg-safefit-highlight/90"
              onClick={handlePersonalInfoSubmit}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
            <Button 
              className="bg-safefit-highlight hover:bg-safefit-highlight/90"
              onClick={handlePasswordChange}
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help & Support Dialog */}
      <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Let us know if you're experiencing any issues
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="issue-type">Issue Type</Label>
              <select
                id="issue-type"
                className="w-full p-2 border rounded-md"
                value={supportData.issue}
                onChange={(e) => setSupportData({...supportData, issue: e.target.value})}
              >
                <option value="">Select an issue</option>
                <option value="hardware">Hardware Issue</option>
                <option value="software">Software Issue</option>
                <option value="subscription">Subscription Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issue-description">Description</Label>
              <Textarea
                id="issue-description"
                rows={5}
                value={supportData.description}
                onChange={(e) => setSupportData({...supportData, description: e.target.value})}
                placeholder="Please describe the issue you're experiencing..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSupportOpen(false)}>Cancel</Button>
            <Button 
              className="bg-safefit-highlight hover:bg-safefit-highlight/90"
              onClick={handleSupportSubmit}
            >
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Dialog */}
      <Dialog open={isTermsOpen} onOpenChange={setIsTermsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Last updated: June 6, 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <h4 className="font-bold text-safefit-dark">1. Introduction</h4>
            <p className="text-sm text-safefit-primary">
              Welcome to SafeFit. By using our application, you agree to these Terms and Conditions, which will result in a legal agreement between you ("you" or the "user") and SafeFit ("we," "us," or "our").
            </p>
            
            <h4 className="font-bold text-safefit-dark">2. Privacy Policy</h4>
            <p className="text-sm text-safefit-primary">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application. By using SafeFit, you consent to our Privacy Policy.
            </p>
            
            <h4 className="font-bold text-safefit-dark">3. Subscription Terms</h4>
            <p className="text-sm text-safefit-primary">
              SafeFit offers subscription services. When you purchase a subscription, you agree to the recurring payment terms presented at the time of purchase. Subscriptions automatically renew unless canceled at least 24 hours before the end of the current period.
            </p>
            
            <h4 className="font-bold text-safefit-dark">4. Health Data</h4>
            <p className="text-sm text-safefit-primary">
              SafeFit collects health data to provide personalized services. This data is stored securely and used only to improve your experience. We do not share your health data with third parties without your consent except as required by law.
            </p>
            
            <h4 className="font-bold text-safefit-dark">5. Emergency Services Disclaimer</h4>
            <p className="text-sm text-safefit-primary">
              SafeFit's safety features are intended as aids and not replacements for professional emergency services. We do not guarantee that our safety features will prevent all injuries or dangerous situations.
            </p>
            
            <h4 className="font-bold text-safefit-dark">6. Limitation of Liability</h4>
            <p className="text-sm text-safefit-primary">
              To the maximum extent permitted by law, SafeFit shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
            </p>
            
            <h4 className="font-bold text-safefit-dark">7. Contact Us</h4>
            <p className="text-sm text-safefit-primary">
              If you have any questions about these Terms, please contact us at support@safefit.com.
            </p>
          </div>
          <DialogFooter>
            <Button 
              className="bg-safefit-highlight hover:bg-safefit-highlight/90"
              onClick={() => setIsTermsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
