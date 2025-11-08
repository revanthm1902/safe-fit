-- Migration: Add parental_code column to user_profiles table
-- Date: November 8, 2025
-- Purpose: Support parental control feature for minors (<18) and seniors (>60)

-- Add parental_code column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_profiles' 
        AND column_name = 'parental_code'
    ) THEN
        ALTER TABLE public.user_profiles 
        ADD COLUMN parental_code TEXT;
        
        RAISE NOTICE 'Column parental_code added successfully';
    ELSE
        RAISE NOTICE 'Column parental_code already exists';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles' 
AND column_name = 'parental_code';

-- Optional: View current user_profiles schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'user_profiles'
ORDER BY ordinal_position;
