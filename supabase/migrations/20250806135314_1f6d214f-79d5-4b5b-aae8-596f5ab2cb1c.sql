-- Add the new constraint that includes 'support' type
ALTER TABLE public.conversations ADD CONSTRAINT conversations_type_check 
CHECK (type IN ('coach', 'admin', 'support', 'consultation', 'general', 'billing', 'technical'));