-- Fix the user type in profiles table and sync the name
UPDATE profiles 
SET user_type = 'individual', full_name = 'shashi'
WHERE user_id = '3f7b32cd-fe95-4f8c-b33f-bf75f647914c';

-- Ensure consistency by updating individual_profiles to match any future changes
UPDATE individual_profiles 
SET full_name = 'shashi'
WHERE user_id = '3f7b32cd-fe95-4f8c-b33f-bf75f647914c';