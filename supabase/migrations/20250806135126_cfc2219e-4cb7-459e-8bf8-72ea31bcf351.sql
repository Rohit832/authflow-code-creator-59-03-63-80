-- Check what type values currently exist
SELECT DISTINCT type FROM public.conversations;

-- Update any invalid type values to 'support' 
UPDATE public.conversations SET type = 'support' WHERE type NOT IN ('support', 'consultation', 'general', 'billing', 'technical');

-- Now drop the existing constraint and add the updated one
ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_type_check;
ALTER TABLE public.conversations ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('support', 'consultation', 'general', 'billing', 'technical'));