-- Clean up individual-related database references
-- Remove individual_conversation_id column from messages table
ALTER TABLE public.messages DROP COLUMN IF EXISTS individual_conversation_id;