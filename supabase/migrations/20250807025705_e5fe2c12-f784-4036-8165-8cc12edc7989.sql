-- Fix the authentication policy for individuals table to resolve loading issues

-- Drop the complex policy that might be causing issues
DROP POLICY IF EXISTS "Allow authentication lookup for individuals" ON public.individuals;

-- Create a simpler, more reliable policy for individual authentication
CREATE POLICY "Enable read access for individuals" 
ON public.individuals 
FOR SELECT 
USING (
  -- Allow authenticated users to read their own data
  id = auth.uid()
);