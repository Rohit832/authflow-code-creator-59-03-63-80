-- First check what values are currently in the type column
SELECT type, COUNT(*) FROM public.conversations GROUP BY type;

-- Check what the current check constraint allows
SELECT conname, consrc FROM pg_constraint 
WHERE conrelid = 'public.conversations'::regclass 
AND contype = 'c';

-- Drop the constraint entirely for now
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_type_check;

-- Add a new constraint that allows the values we need
ALTER TABLE public.conversations ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('support', 'consultation', 'general', 'billing', 'technical', 'client_support'));