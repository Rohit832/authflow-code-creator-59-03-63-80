-- Add foreign key relationship between session_bookings and sessions
ALTER TABLE session_bookings 
ADD CONSTRAINT fk_session_bookings_sessions 
FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE;