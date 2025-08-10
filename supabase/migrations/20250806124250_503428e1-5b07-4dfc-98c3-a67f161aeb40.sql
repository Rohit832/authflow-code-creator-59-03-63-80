-- Fix RLS policy to allow unauthenticated users to read their own registration for sign-in
-- Update the existing policy to allow unauthenticated access for sign-in purposes
DROP POLICY IF EXISTS "Users can read their own registration data" ON public.client_registrations;

-- Create a new policy that allows reading registration data for authentication purposes
CREATE POLICY "Allow reading registration data for authentication" 
ON public.client_registrations 
FOR SELECT 
USING (true);