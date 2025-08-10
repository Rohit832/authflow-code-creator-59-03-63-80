-- Update booking records to reflect correct credit amounts based on session requirements
UPDATE session_bookings 
SET credits_used = (
  SELECT credits_required 
  FROM sessions 
  WHERE sessions.id = session_bookings.session_id
)
WHERE session_id IN (
  SELECT id FROM sessions WHERE credits_required != 1
);