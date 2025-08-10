
-- Fix the session_bookings table to have proper foreign key relationship
ALTER TABLE session_bookings 
ADD CONSTRAINT fk_session_bookings_sessions 
FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;

-- Also ensure the individual_bookings table has proper relationships
ALTER TABLE individual_bookings 
ADD CONSTRAINT fk_individual_bookings_service_plans 
FOREIGN KEY (plan_id) REFERENCES service_plans(id) ON DELETE SET NULL;

ALTER TABLE individual_bookings 
ADD CONSTRAINT fk_individual_bookings_users 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
