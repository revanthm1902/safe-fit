
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, Phone, Calendar, MapPin, Users, 
  Bell, Shield, Moon, Sun, Volume2, VolumeX, 
  LogOut, Save, Settings as SettingsIcon 
} from 'lucide-react';

interface SettingsProps {
  user: any;
  onSignOut: () => void;
}

const Settings = ({ user, onSignOut }: SettingsProps) => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Load profile data from localStorage
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setProfileData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || '',
        address: profile.address || ''
      });
    }
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update localStorage
      localStorage.setItem('userProfile', JSON.stringify({
        userId: user.id,
        email: user.email,
        ...profileData
      }));

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('userProfile');
      localStorage.removeItem('emergencyContacts');
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      });
      
      onSignOut();
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-safefit-white p-4 pt-20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-8 w-8 text-safefit-primary mr-3" />
          <h1 className="text-3xl font-bold text-safefit-dark">Settings</h1>
        </div>
        <p className="text-safefit-primary">Manage your account and preferences</p>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6 border border-safefit-border bg-white">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-safefit-primary mr-3" />
            <h3 className="text-lg font-bold text-safefit-dark">Personal Information</h3>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name" className="text-safefit-dark">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="mt-1 border-safefit-border"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-safefit-dark">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 border-safefit-border"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth" className="text-safefit-dark">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={profileData.date_of_birth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                  className="mt-1 border-safefit-border"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-safefit-dark">Gender</Label>
                <Select value={profileData.gender} onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="mt-1 border-safefit-border">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="address" className="text-safefit-dark">Address</Label>
              <Input
                id="address"
                value={profileData.address}
                onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                className="mt-1 border-safefit-border"
                placeholder="Enter your address"
              />
            </div>
            
            <Button
              onClick={handleSaveProfile}
              disabled={loading}
              className="bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* App Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <Card className="p-6 border border-safefit-border bg-white">
          <h3 className="text-lg font-bold text-safefit-dark mb-4">App Preferences</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-safefit-primary" />
                <span className="text-safefit-dark">Push Notifications</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNotifications(!notifications)}
                className={notifications ? 'bg-safefit-highlight text-white' : 'text-safefit-primary'}
              >
                {notifications ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {sounds ? <Volume2 className="h-5 w-5 text-safefit-primary" /> : <VolumeX className="h-5 w-5 text-safefit-primary" />}
                <span className="text-safefit-dark">Sound Effects</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSounds(!sounds)}
                className={sounds ? 'bg-safefit-highlight text-white' : 'text-safefit-primary'}
              >
                {sounds ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {darkMode ? <Moon className="h-5 w-5 text-safefit-primary" /> : <Sun className="h-5 w-5 text-safefit-primary" />}
                <span className="text-safefit-dark">Dark Mode</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDarkMode(!darkMode)}
                className={darkMode ? 'bg-safefit-highlight text-white' : 'text-safefit-primary'}
              >
                {darkMode ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Account Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 border border-safefit-border bg-white">
          <h3 className="text-lg font-bold text-safefit-dark mb-4">Account</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-safefit-dark font-medium">Email</span>
              <span className="text-safefit-primary">{user?.email}</span>
            </div>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Settings;
