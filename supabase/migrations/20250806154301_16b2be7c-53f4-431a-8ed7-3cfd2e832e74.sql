-- Make conversation_id nullable since we're using specific conversation ID fields
ALTER TABLE public.messages 
ALTER COLUMN conversation_id DROP NOT NULL;