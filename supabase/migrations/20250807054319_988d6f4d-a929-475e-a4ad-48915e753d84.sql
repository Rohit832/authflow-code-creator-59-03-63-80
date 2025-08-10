-- Update RLS policy for session_bookings to allow clients to create bookings
DROP POLICY IF EXISTS "Users can create their own bookings" ON session_bookings;

CREATE POLICY "Users can create their own bookings" 
ON session_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also ensure users can view their own bookings
DROP POLICY IF EXISTS "Users can view their own bookings" ON session_bookings;

CREATE POLICY "Users can view their own bookings" 
ON session_bookings 
FOR SELECT 
USING (auth.uid() = user_id);