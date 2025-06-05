
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { User, Bell, Shield, Palette, Download, LogOut, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SettingsProps {
  user: any;
}

const Settings = ({ user }: SettingsProps) => {
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [fallDetection, setFallDetection] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "See you next time!",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportHealthData = async () => {
    try {
      const { data: metrics, error } = await supabase
        .from('user_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      const dataStr = JSON.stringify(metrics, null, 2);
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

  const settingsGroups = [
    {
      title: "Profile",
      items: [
        { icon: User, label: "Personal Information", action: () => console.log('Profile') },
        { icon: Shield, label: "Privacy & Security", action: () => console.log('Privacy') }
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
      title: "Data",
      items: [
        { icon: Download, label: "Export Health Data", action: exportHealthData },
        { icon: Palette, label: "Theme Settings", action: () => console.log('Theme') }
      ]
    }
  ];

  return (
    <div className="p-4 pt-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-300">Customize your SafeFit experience</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {userProfile?.full_name || 'User'}
              </h3>
              <p className="text-gray-300">{user?.email || 'user@example.com'}</p>
              <p className="text-teal-400 text-sm">Premium Member</p>
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
          <Card className="p-6 bg-white/10 backdrop-blur-lg border border-white/20">
            <h3 className="text-lg font-bold text-white mb-4">{group.title}</h3>
            <div className="space-y-4">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div key={itemIndex}>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <span className="text-white font-medium">{item.label}</span>
                      </div>
                      {item.toggle !== undefined ? (
                        <Switch
                          checked={item.toggle}
                          onCheckedChange={item.onToggle}
                          className="data-[state=checked]:bg-teal-500"
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={item.action}
                          className="text-gray-400 hover:text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {itemIndex < group.items.length - 1 && (
                      <Separator className="bg-white/10" />
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
          className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
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
        <p className="text-gray-400 text-sm">SafeFit v1.0.0</p>
        <p className="text-gray-500 text-xs mt-1">Your health and safety companion</p>
      </motion.div>
    </div>
  );
};

export default Settings;
