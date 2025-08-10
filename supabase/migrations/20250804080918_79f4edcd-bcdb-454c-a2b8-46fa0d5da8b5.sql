-- Add individual to the user_type enum
ALTER TYPE user_type ADD VALUE 'individual';

-- Create a profile for the existing user
INSERT INTO public.profiles (user_id, full_name, user_type)
SELECT 
  '233fff18-89e9-4059-917c-d9d834866be0',
  'Rohitsaw',
  'individual'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = '233fff18-89e9-4059-917c-d9d834866be0'
);