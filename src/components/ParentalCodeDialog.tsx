import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Shield, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ParentalCodeDialogProps {
  isOpen: boolean;
  parentalCode: string;
  userAge: number;
  onClose: () => void;
}

const ParentalCodeDialog = ({ isOpen, parentalCode, userAge, onClose }: ParentalCodeDialogProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(parentalCode);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Parental access code copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const ageMessage = userAge < 18 
    ? 'Under 18 years old' 
    : 'Over 60 years old';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
          </div>
          <DialogTitle className="text-2xl text-center">Parental Control Code</DialogTitle>
          <DialogDescription className="text-center">
            {ageMessage} - This account requires parental supervision
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-600 mb-2 text-center font-medium">
              Parental Access Code
            </p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-center tracking-widest text-purple-600 mb-4"
            >
              {parentalCode}
            </motion.div>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full border-purple-300 hover:bg-purple-100"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Important Information
            </h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Share this code with a parent or guardian</li>
              <li>• Keep this code safe and secure</li>
              <li>• Code can be viewed anytime in Settings</li>
              <li>• Required for parental access and monitoring</li>
            </ul>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Continue to App
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ParentalCodeDialog;
