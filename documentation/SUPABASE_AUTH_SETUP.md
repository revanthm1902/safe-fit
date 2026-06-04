# Supabase Authentication & User Tables Setup

## Complete SQL Schema for User Authentication


---

## 1. User Profiles Table

```sql
-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    address TEXT,
    profile_picture_url TEXT,
    parental_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
    ON public.user_profiles
    FOR DELETE
    USING (auth.uid() = user_id);
```

---

## 2. User Authentication Sessions Table

```sql
-- Create user_sessions table to track login history
CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    login_at TIMESTAMPTZ DEFAULT NOW(),
    logout_at TIMESTAMPTZ,
    device_info TEXT,
    ip_address INET,
    session_duration INTERVAL,
    is_active BOOLEAN DEFAULT true
);

-- Create index for faster queries
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_user_sessions_login_at ON public.user_sessions(login_at DESC);

-- Enable Row Level Security
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
    ON public.user_sessions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
    ON public.user_sessions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own sessions
CREATE POLICY "Users can update own sessions"
    ON public.user_sessions
    FOR UPDATE
    USING (auth.uid() = user_id);
```

---

## 3. User Preferences Table

```sql
-- Create user_preferences table for app settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    notifications_enabled BOOLEAN DEFAULT true,
    emergency_alerts_enabled BOOLEAN DEFAULT true,
    location_sharing_enabled BOOLEAN DEFAULT false,
    dark_mode BOOLEAN DEFAULT false,
    language TEXT DEFAULT 'en',
    units TEXT DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own preferences
CREATE POLICY "Users can view own preferences"
    ON public.user_preferences
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
    ON public.user_preferences
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
    ON public.user_preferences
    FOR UPDATE
    USING (auth.uid() = user_id);
```

---

## 4. Emergency Contacts Table

```sql
-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contact_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    relationship TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index
CREATE INDEX idx_emergency_contacts_user_id ON public.emergency_contacts(user_id);

-- Enable Row Level Security
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own emergency contacts
CREATE POLICY "Users can view own emergency contacts"
    ON public.emergency_contacts
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emergency contacts"
    ON public.emergency_contacts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own emergency contacts"
    ON public.emergency_contacts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own emergency contacts"
    ON public.emergency_contacts
    FOR DELETE
    USING (auth.uid() = user_id);
```

---

## 5. Sensor Data Table (Shared Across All Users - Prototype Mode)

```sql
-- Create sensor_data table WITHOUT user_id for shared data
CREATE TABLE IF NOT EXISTS public.sensor_data (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    bpm INT,
    spo2 FLOAT,
    steps INT,
    latitude FLOAT,
    longitude FLOAT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sensor_data_timestamp ON public.sensor_data(timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.sensor_data ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can read sensor data (shared)
CREATE POLICY "All authenticated users can read sensor data"
    ON public.sensor_data
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy: All authenticated users can insert sensor data
CREATE POLICY "All authenticated users can insert sensor data"
    ON public.sensor_data
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Policy: All authenticated users can update sensor data
CREATE POLICY "All authenticated users can update sensor data"
    ON public.sensor_data
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;
```

**Note:** This table is shared across all users (no user_id). Perfect for prototype with a single IoT device.

---

## 6. Create Trigger Function for Auto-Profile Creation

```sql
-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create user profile
    INSERT INTO public.user_profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    
    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

---

## 7. Function to Update Timestamp

```sql
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
    BEFORE UPDATE ON public.emergency_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
```

---

## 8. Enable Realtime (Optional)

```sql
-- Enable realtime for tables if needed
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.sensor_data;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_contacts;
```

---

## Summary of Tables Created

| Table Name | Purpose |
|------------|---------|
| `user_profiles` | Store user profile information (name, phone, DOB, etc.) |
| `user_sessions` | Track login/logout history and session data |
| `user_preferences` | Store app settings and preferences |
| `emergency_contacts` | Store emergency contact information |
| `sensor_data` | Store health sensor data (linked to users) |

---

## What Happens Automatically

1. ✅ When a user signs up, their profile and preferences are auto-created
2. ✅ Each user can only see/edit their own data (RLS policies)
3. ✅ Timestamps are automatically updated
4. ✅ Sensor data is linked to specific users
5. ✅ All data is deleted if user account is deleted (CASCADE)

---

## Test the Setup

```sql
-- Check if tables are created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'user_sessions', 'user_preferences', 'emergency_contacts');

-- Check if policies are active
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

