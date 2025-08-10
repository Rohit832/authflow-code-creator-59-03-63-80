-- First, create missing individual profiles for users who have individual bookings
-- but are currently stored in client_profiles

INSERT INTO individual_profiles (user_id, full_name, created_at)
SELECT DISTINCT 
    cp.user_id,
    cp.full_name,
    cp.created_at
FROM client_profiles cp
INNER JOIN individual_bookings ib ON cp.user_id = ib.user_id
WHERE cp.user_id NOT IN (SELECT user_id FROM individual_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Update conversations table to properly reflect user types
-- Set user_type to 'individual' for users who have individual bookings
UPDATE conversations 
SET user_type = 'individual'
WHERE client_id IN (
    SELECT DISTINCT user_id 
    FROM individual_bookings
);

-- Remove users from client_profiles who should be individuals
-- (users who have individual bookings)
DELETE FROM client_profiles 
WHERE user_id IN (
    SELECT DISTINCT user_id 
    FROM individual_bookings
);