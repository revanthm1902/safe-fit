import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface AuthScreenProps {
  onAuthSuccess: (userData: any) => void;
}
const AuthScreen = ({
  onAuthSuccess
}: AuthScreenProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const {
          data,
          error
        } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        // Check if user has completed profile
        const {
          data: profile
        } = await supabase.from('user_profiles').select('*').eq('user_id', data.user.id).single();
        onAuthSuccess({
          user: data.user,
          hasProfile: profile && profile.full_name && profile.phone
        });
      } else {
        const {
          data,
          error
        } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        if (data.user) {
          toast({
            title: "Account created!",
            description: "Please complete your profile to get started."
          });
          onAuthSuccess({
            user: data.user,
            hasProfile: false
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Authentication failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 bg-zinc-50">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.6
    }} className="w-full max-w-md">
        <Card className="p-8 bg-white/10 backdrop-blur-lg border border-white/20">
          <div className="text-center mb-8">
            <motion.div initial={{
            scale: 0.8
          }} animate={{
            scale: 1
          }} className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-teal-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">SF</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join SafeFit'}
            </h2>
            <p className="text-gray-300">
              {isLogin ? 'Sign in to your account' : 'Create your safety companion account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div initial={{
            x: -20,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            delay: 0.1
          }}>
              <Input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="bg-white/10 border-white/30 text-white placeholder-gray-300" required />
            </motion.div>

            <motion.div initial={{
            x: -20,
            opacity: 0
          }} animate={{
            x: 0,
            opacity: 1
          }} transition={{
            delay: 0.2
          }}>
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="bg-white/10 border-white/30 text-white placeholder-gray-300" required />
            </motion.div>

            <motion.div initial={{
            y: 20,
            opacity: 0
          }} animate={{
            y: 0,
            opacity: 1
          }} transition={{
            delay: 0.3
          }}>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-semibold py-3">
                {loading ? <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </div> : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </motion.div>
          </form>

          <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 0.4
        }} className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-teal-400 hover:text-teal-300 transition-colors">
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </motion.div>
        </Card>
      </motion.div>
    </div>;
};
export default AuthScreen;