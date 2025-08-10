-- Let's check what auth context we have and temporarily disable RLS to test
-- First, let's check if we can see the user
-- Add a temporary debugging function
CREATE OR REPLACE FUNCTION public.debug_auth_context()
RETURNS JSON AS $$
BEGIN
  RETURN json_build_object(
    'auth_uid', auth.uid(),
    'auth_role', auth.role(),
    'current_user', current_user,
    'session_user', session_user
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Let's temporarily add a more permissive policy for debugging
DROP POLICY IF EXISTS "Temporary debug policy for session_bookings" ON session_bookings;

CREATE POLICY "Temporary debug policy for session_bookings" 
ON session_bookings 
FOR ALL
USING (true)
WITH CHECK (true);