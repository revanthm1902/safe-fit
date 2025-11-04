import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============ TypeScript Types for Database Tables ============

// Types for sensor_data table (shared across all users - prototype mode)
export interface SensorData {
  id: number;
  bpm: number | null;
  spo2: number | null;
  steps: number | null;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
}

// Types for user_profiles table
export interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  address: string | null;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

// Types for user_sessions table
export interface UserSession {
  id: string;
  user_id: string;
  login_at: string;
  logout_at: string | null;
  device_info: string | null;
  ip_address: string | null;
  session_duration: string | null;
  is_active: boolean;
}

// Types for user_preferences table
export interface UserPreferences {
  id: string;
  user_id: string;
  notifications_enabled: boolean;
  emergency_alerts_enabled: boolean;
  location_sharing_enabled: boolean;
  dark_mode: boolean;
  language: string;
  units: 'metric' | 'imperial';
  created_at: string;
  updated_at: string;
}

// Types for emergency_contacts table
export interface EmergencyContact {
  id: string;
  user_id: string;
  contact_name: string;
  phone_number: string;
  relationship: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Database type for better type safety
export interface Database {
  public: {
    Tables: {
      sensor_data: {
        Row: SensorData;
        Insert: Omit<SensorData, 'id' | 'timestamp'>;
        Update: Partial<Omit<SensorData, 'id'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at'>>;
      };
      user_sessions: {
        Row: UserSession;
        Insert: Omit<UserSession, 'id' | 'login_at'>;
        Update: Partial<Omit<UserSession, 'id' | 'user_id'>>;
      };
      user_preferences: {
        Row: UserPreferences;
        Insert: Omit<UserPreferences, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at'>>;
      };
      emergency_contacts: {
        Row: EmergencyContact;
        Insert: Omit<EmergencyContact, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmergencyContact, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}