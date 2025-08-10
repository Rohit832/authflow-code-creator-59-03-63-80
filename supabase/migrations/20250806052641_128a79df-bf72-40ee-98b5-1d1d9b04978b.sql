-- First, let's check and fix the RLS policies for the admins table
-- The current policy might be too restrictive for signup

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Admins can view their own data" ON public.admins;
DROP POLICY IF EXISTS "Allow admin signup" ON public.admins;
DROP POLICY IF EXISTS "Super admins can view all admin data" ON public.admins;

-- Create proper policies that allow signup
CREATE POLICY "Allow initial admin signup" ON public.admins
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view their own data" ON public.admins
FOR SELECT 
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can update their own data" ON public.admins
FOR UPDATE 
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Super admins can view all admin data" ON public.admins
FOR SELECT 
TO authenticated
USING (is_super_admin = true AND id = auth.uid());

-- Also fix the admin_profiles table policies
DROP POLICY IF EXISTS "Admins can insert their own profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Super admins can view all admin profiles" ON public.admin_profiles;

CREATE POLICY "Allow admin profile creation" ON public.admin_profiles
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view their own profile" ON public.admin_profiles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can update their own profile" ON public.admin_profiles
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());