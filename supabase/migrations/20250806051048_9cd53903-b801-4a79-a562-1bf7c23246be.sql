-- Fix RLS policies for admin signup
-- First, ensure the admin signup policy allows self-insertion
DROP POLICY IF EXISTS "Allow admin signup" ON public.admins;
CREATE POLICY "Allow admin signup" 
ON public.admins 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Create a policy to allow admins to view their own data after signup
DROP POLICY IF EXISTS "Admins can view their own data" ON public.admins;
CREATE POLICY "Admins can view their own data" 
ON public.admins 
FOR ALL 
USING (id = auth.uid());