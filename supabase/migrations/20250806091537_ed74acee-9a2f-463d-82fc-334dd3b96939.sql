-- Drop admin_permissions table
DROP TABLE IF EXISTS public.admin_permissions CASCADE;

-- Drop admins table  
DROP TABLE IF EXISTS public.admins CASCADE;

-- Ensure admin_profiles has all necessary columns for admin functionality
ALTER TABLE public.admin_profiles 
ADD COLUMN IF NOT EXISTS email text UNIQUE,
ADD COLUMN IF NOT EXISTS password_hash text,
ADD COLUMN IF NOT EXISTS role text DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone;

-- Update the admin_profiles table to have email as required if it's not already
ALTER TABLE public.admin_profiles 
ALTER COLUMN email SET NOT NULL;