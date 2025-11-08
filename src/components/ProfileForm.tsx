import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, Phone, Calendar, Users, MapPin, Ruler, Weight } from 'lucide-react';
import ParentalCodeDialog from './ParentalCodeDialog';
import { Preferences } from '@capacitor/preferences';

interface ProfileFormProps {
  user: SupabaseUser;
  onComplete: () => void;
}

const ProfileForm = ({ user, onComplete }: ProfileFormProps) => {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    height: '',
    height_unit: 'cm',
    weight: '',
    weight_unit: 'kg'
  });
  const [loading, setLoading] = useState(false);
  const [showParentalCode, setShowParentalCode] = useState(false);
  const [parentalCode, setParentalCode] = useState('');
  const [userAge, setUserAge] = useState(0);
  const { toast } = useToast();

  const generateParentalCode = (): string => {
    // Generate 8-digit code
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const age = calculateAge(formData.date_of_birth);
      setUserAge(age);
      
      // Check if parental control is needed (age < 18 or age > 60)
      const needsParentalControl = age < 18 || age > 60;
      let generatedCode = '';
      
      if (needsParentalControl) {
        generatedCode = generateParentalCode();
        setParentalCode(generatedCode);
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          height: parseFloat(formData.height),
          height_unit: formData.height_unit,
          weight: parseFloat(formData.weight),
          weight_unit: formData.weight_unit,
          parental_code: needsParentalControl ? generatedCode : null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Store profile data in both localStorage (web) and Capacitor Preferences (mobile)
      const profileData = {
        full_name: formData.full_name,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        address: formData.address,
        height: parseFloat(formData.height),
        height_unit: formData.height_unit,
        weight: parseFloat(formData.weight),
        weight_unit: formData.weight_unit,
        parental_code: needsParentalControl ? generatedCode : null,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      // Store in localStorage for web
      localStorage.setItem(`profile_${user.id}`, JSON.stringify(profileData));
      
      // Store in Capacitor Preferences for mobile (async storage)
      try {
        await Preferences.set({
          key: `profile_${user.id}`,
          value: JSON.stringify(profileData)
        });
      } catch (prefError) {
        console.log('Capacitor Preferences not available (web mode):', prefError);
      }

      if (needsParentalControl) {
        // Show parental code dialog
        setShowParentalCode(true);
      } else {
        toast({
          title: "Profile completed!",
          description: "Welcome to SafeFit! Your profile has been saved.",
        });
        onComplete();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
      toast({
        title: "Error saving profile",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full flex items-center justify-center"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h2>
            <p className="text-gray-300">Tell us a bit about yourself to personalize your SafeFit experience</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative"
            >
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-gray-300 pl-10"
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-gray-300 pl-10"
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="date"
                placeholder="Date of Birth"
                value={formData.date_of_birth}
                onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-gray-300 pl-10"
                required
              />
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <SelectValue placeholder="Select Gender" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Address (Optional)"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder-gray-300 pl-10"
              />
            </motion.div>

            {/* Height Input */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-2"
            >
              <div className="col-span-2 relative">
                <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Height"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder-gray-300 pl-10"
                  required
                />
              </div>
              <Select value={formData.height_unit} onValueChange={(value) => handleInputChange('height_unit', value)}>
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">cm</SelectItem>
                  <SelectItem value="ft">ft</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            {/* Weight Input */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="grid grid-cols-3 gap-2"
            >
              <div className="col-span-2 relative">
                <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="number"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder-gray-300 pl-10"
                  required
                />
              </div>
              <Select value={formData.weight_unit} onValueChange={(value) => handleInputChange('weight_unit', value)}>
                <SelectTrigger className="bg-white/10 border-white/30 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="lbs">lbs</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button
                type="submit"
                disabled={loading || !formData.full_name || !formData.phone || !formData.height || !formData.weight}
                className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-semibold py-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving Profile...
                  </div>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </motion.div>
          </form>
        </Card>
      </motion.div>

      {/* Parental Code Dialog */}
      <ParentalCodeDialog
        isOpen={showParentalCode}
        parentalCode={parentalCode}
        userAge={userAge}
        onClose={() => {
          setShowParentalCode(false);
          toast({
            title: "Profile completed!",
            description: "Welcome to SafeFit! Your profile has been saved.",
          });
          onComplete();
        }}
      />
    </div>
  );
};

export default ProfileForm;
