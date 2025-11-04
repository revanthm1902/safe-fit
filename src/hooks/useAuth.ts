import { useState, useEffect } from 'react';
import { supabase, type UserProfile, type UserPreferences } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  // Fetch user preferences
  const fetchPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (err) {
      console.error('Error fetching preferences:', err);
    }
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPreferences(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchPreferences(session.user.id);
      } else {
        setProfile(null);
        setPreferences(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Log session
      if (data.user) {
        await supabase.from('user_sessions').insert({
          user_id: data.user.id,
          device_info: navigator.userAgent,
        });
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up
  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Profile and preferences are created automatically via trigger
      // Log session
      if (data.user) {
        await supabase.from('user_sessions').insert({
          user_id: data.user.id,
          device_info: navigator.userAgent,
        });
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update session logout time
      if (user) {
        await supabase
          .from('user_sessions')
          .update({
            logout_at: new Date().toISOString(),
            is_active: false,
          })
          .eq('user_id', user.id)
          .eq('is_active', true);
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setPreferences(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) throw new Error('No user logged in');

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    preferences,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePreferences,
  };
};
