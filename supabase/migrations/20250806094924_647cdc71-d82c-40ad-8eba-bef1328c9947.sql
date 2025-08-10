-- Allow checking admin status for sign-in verification
-- This policy allows reading admin profiles for authentication purposes
CREATE POLICY "Allow admin status check for authentication" 
ON admin_profiles 
FOR SELECT 
USING (true);

-- Drop the existing restrictive policy if it exists
DROP POLICY IF EXISTS "Admins can view their own profile" ON admin_profiles;