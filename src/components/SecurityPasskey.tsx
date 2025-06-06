
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { Lock, Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

interface SecurityPasskeyProps {
  user: any;
  onPasskeyVerified: () => void;
}

const SecurityPasskey = ({ user, onPasskeyVerified }: SecurityPasskeyProps) => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [passkey, setPasskey] = useState('');
  const [confirmPasskey, setConfirmPasskey] = useState('');
  const [showPasskey, setShowPasskey] = useState(false);
  const [showConfirmPasskey, setShowConfirmPasskey] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has a passkey stored
    const storedPasskey = localStorage.getItem(`passkey_${user?.id}`);
    setIsNewUser(!storedPasskey);
  }, [user]);

  const handleSetPasskey = () => {
    if (!passkey || passkey.length < 6) {
      toast({
        title: "Invalid Passkey",
        description: "Passkey must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    if (passkey !== confirmPasskey) {
      toast({
        title: "Passkeys don't match",
        description: "Please make sure both passkeys are identical",
        variant: "destructive"
      });
      return;
    }

    // Store the passkey (in a real app, this would be encrypted)
    localStorage.setItem(`passkey_${user?.id}`, passkey);
    toast({
      title: "Passkey Set Successfully",
      description: "Your medical data is now secured with a passkey"
    });
    
    setIsDialogOpen(false);
    onPasskeyVerified();
  };

  const handleVerifyPasskey = () => {
    const storedPasskey = localStorage.getItem(`passkey_${user?.id}`);
    
    if (passkey === storedPasskey) {
      toast({
        title: "Access Granted",
        description: "Welcome back to SafeFit"
      });
      setIsDialogOpen(false);
      onPasskeyVerified();
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect passkey. Please try again.",
        variant: "destructive"
      });
      setPasskey('');
    }
  };

  const handleSubmit = () => {
    if (isNewUser) {
      handleSetPasskey();
    } else {
      handleVerifyPasskey();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-safefit-primary to-safefit-highlight rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-safefit-dark text-xl">
            {isNewUser ? 'Secure Your Medical Data' : 'Enter Your Passkey'}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {isNewUser 
              ? 'As a medical app, SafeFit requires a security passkey to protect your sensitive health information.'
              : 'Please enter your passkey to access your medical data.'
            }
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-4"
        >
          <div className="space-y-2">
            <Label htmlFor="passkey" className="text-safefit-dark font-medium">
              {isNewUser ? 'Create Passkey' : 'Enter Passkey'}
            </Label>
            <div className="relative">
              <Input
                id="passkey"
                type={showPasskey ? 'text' : 'password'}
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder={isNewUser ? 'Create a secure passkey' : 'Enter your passkey'}
                className="border-gray-300 focus:border-safefit-highlight pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-safefit-highlight"
                onClick={() => setShowPasskey(!showPasskey)}
              >
                {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isNewUser && (
            <div className="space-y-2">
              <Label htmlFor="confirm-passkey" className="text-safefit-dark font-medium">
                Confirm Passkey
              </Label>
              <div className="relative">
                <Input
                  id="confirm-passkey"
                  type={showConfirmPasskey ? 'text' : 'password'}
                  value={confirmPasskey}
                  onChange={(e) => setConfirmPasskey(e.target.value)}
                  placeholder="Confirm your passkey"
                  className="border-gray-300 focus:border-safefit-highlight pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-safefit-highlight"
                  onClick={() => setShowConfirmPasskey(!showConfirmPasskey)}
                >
                  {showConfirmPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}

          {isNewUser && (
            <Card className="p-3 bg-blue-50 border border-blue-200">
              <div className="flex items-start space-x-2">
                <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium">Security Tips:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Use at least 6 characters</li>
                    <li>• Mix letters, numbers, and symbols</li>
                    <li>• Don't use personal information</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full bg-safefit-highlight hover:bg-safefit-highlight/90 text-white"
            disabled={!passkey || (isNewUser && !confirmPasskey)}
          >
            {isNewUser ? 'Set Passkey' : 'Verify Passkey'}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default SecurityPasskey;
