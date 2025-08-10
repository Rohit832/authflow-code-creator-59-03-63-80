-- Add user_type column to conversations table to properly separate client and individual chats
ALTER TABLE public.conversations 
ADD COLUMN user_type text DEFAULT 'client';

-- Update existing conversations to set user_type based on the type column
UPDATE public.conversations 
SET user_type = CASE 
  WHEN type IN ('individual_support', 'individual_coaching') THEN 'individual'
  ELSE 'client'
END;

-- Create index for better performance when filtering by user_type
CREATE INDEX idx_conversations_user_type ON public.conversations(user_type);

-- Create index for filtering conversations by user_type and client_id
CREATE INDEX idx_conversations_user_type_client_id ON public.conversations(user_type, client_id);