-- Check current constraints on conversations table
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_schema = 'public' 
AND constraint_name LIKE '%conversations%';

-- Drop the existing type check constraint and create a new one that allows 'support'
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_type_check;

-- Add updated check constraint that includes 'support' as a valid type
ALTER TABLE public.conversations ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('support', 'consultation', 'general', 'billing', 'technical'));