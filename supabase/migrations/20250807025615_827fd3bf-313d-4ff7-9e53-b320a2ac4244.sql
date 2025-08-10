-- Update RLS policies for individuals table to fix authentication issues

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow email lookup for authentication" ON public.individuals;

-- Create a more secure policy for authentication lookup
CREATE POLICY "Allow authentication lookup for individuals" 
ON public.individuals 
FOR SELECT 
USING (
  -- Allow users to read their own data when authenticated
  id = auth.uid() 
  OR 
  -- Allow reading during sign-in process (when auth.uid() might be null temporarily)
  (auth.uid() IS NULL AND id IN (
    SELECT id FROM auth.users WHERE email = individuals.email
  ))
);

-- Ensure the individuals table has proper RLS enabled
ALTER TABLE public.individuals ENABLE ROW LEVEL SECURITY;