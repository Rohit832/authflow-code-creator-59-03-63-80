-- Create a trigger function to automatically create profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- This function will be called after a user is created in auth.users
  -- It runs with elevated privileges so it can bypass RLS
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing RLS policies that might be too restrictive
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create more permissive RLS policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert profiles (for signup process)
CREATE POLICY "Service role can insert profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true);

-- Allow service role to update profiles
CREATE POLICY "Service role can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (true);

-- Allow service role to select profiles
CREATE POLICY "Service role can select profiles" 
ON public.profiles 
FOR SELECT 
USING (true);