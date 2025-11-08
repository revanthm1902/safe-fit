-- Add height and weight columns to user_profiles table
-- Migration: Add height and weight fields with units
-- Created: 2025-11-08

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS height NUMERIC,
ADD COLUMN IF NOT EXISTS height_unit VARCHAR(10) DEFAULT 'cm',
ADD COLUMN IF NOT EXISTS weight NUMERIC,
ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';

-- Add comments for documentation
COMMENT ON COLUMN user_profiles.height IS 'User height value';
COMMENT ON COLUMN user_profiles.height_unit IS 'Unit of measurement for height (cm or ft)';
COMMENT ON COLUMN user_profiles.weight IS 'User weight value';
COMMENT ON COLUMN user_profiles.weight_unit IS 'Unit of measurement for weight (kg or lbs)';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_height ON user_profiles(height);
CREATE INDEX IF NOT EXISTS idx_user_profiles_weight ON user_profiles(weight);
