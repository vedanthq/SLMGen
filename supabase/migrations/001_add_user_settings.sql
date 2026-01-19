-- SLMGEN Schema Migration: Add User Settings
-- Run this in Supabase SQL Editor if you already have the base schema

-- Add settings columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';

-- Add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'User bio/description';
COMMENT ON COLUMN profiles.notifications_enabled IS 'Email notification preference';
COMMENT ON COLUMN profiles.theme IS 'UI theme preference (dark/light/system)';
