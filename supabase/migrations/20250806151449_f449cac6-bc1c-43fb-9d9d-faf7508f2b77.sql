-- Create individual profiles for users who have individual bookings but no profile yet
INSERT INTO individual_profiles (user_id, full_name, created_at)
SELECT DISTINCT 
    ib.user_id,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Individual User') as full_name,
    now() as created_at
FROM individual_bookings ib
LEFT JOIN auth.users au ON ib.user_id = au.id
WHERE ib.user_id NOT IN (SELECT user_id FROM individual_profiles)
ON CONFLICT (user_id) DO NOTHING;