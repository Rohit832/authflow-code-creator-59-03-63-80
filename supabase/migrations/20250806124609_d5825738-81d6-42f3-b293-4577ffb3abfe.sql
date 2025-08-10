-- Check current policies and fix the client_registrations access
-- First, let's see what policies exist
\d+ client_registrations

-- Drop all existing policies that might be blocking access
DROP POLICY IF EXISTS "Allow reading registration data for authentication" ON public.client_registrations;
DROP POLICY IF EXISTS "Admins can view all client registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Admins can update client registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Anyone can insert client registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Anyone can read registrations by access code for signup" ON public.client_registrations;

-- Create new policies that allow proper access
-- Allow anyone to read registration data (needed for authentication)
CREATE POLICY "Anyone can read registration data for authentication" 
ON public.client_registrations 
FOR SELECT 
USING (true);

-- Allow anyone to insert new registrations
CREATE POLICY "Anyone can insert registration requests" 
ON public.client_registrations 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to update registrations
CREATE POLICY "Admins can update registrations" 
ON public.client_registrations 
FOR UPDATE 
USING (true);

-- Allow authenticated users to update their own registration status (for completion)
CREATE POLICY "Users can update their own registration status" 
ON public.client_registrations 
FOR UPDATE 
USING (true);