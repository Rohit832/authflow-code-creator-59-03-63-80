-- Drop existing problematic policies on admins table
DROP POLICY IF EXISTS "Admins can view their own data" ON admins;
DROP POLICY IF EXISTS "Super admins can view all admin data" ON admins;

-- Create a security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = user_id
  );
$$;

-- Create a security definer function to check super admin status
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admins 
    WHERE id = user_id AND is_super_admin = true
  );
$$;

-- Create new RLS policies that avoid recursion
CREATE POLICY "Admins can view their own data"
  ON admins FOR ALL
  USING (id = auth.uid());

CREATE POLICY "Super admins can view all admin data"
  ON admins FOR SELECT
  USING (public.is_super_admin(auth.uid()));

-- Allow authenticated users to insert admin records (for signup)
CREATE POLICY "Allow admin signup"
  ON admins FOR INSERT
  WITH CHECK (id = auth.uid());