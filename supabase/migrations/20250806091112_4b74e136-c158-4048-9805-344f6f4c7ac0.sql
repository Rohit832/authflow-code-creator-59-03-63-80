-- Add is_approved column to admin_profiles table
ALTER TABLE admin_profiles 
ADD COLUMN is_approved boolean NOT NULL DEFAULT false;