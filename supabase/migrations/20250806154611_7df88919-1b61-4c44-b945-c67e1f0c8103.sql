-- Drop the existing constraint
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_type_check;

-- Add updated constraint that includes 'individual'
ALTER TABLE public.messages 
ADD CONSTRAINT messages_sender_type_check 
CHECK (sender_type IN ('client', 'admin', 'individual'));