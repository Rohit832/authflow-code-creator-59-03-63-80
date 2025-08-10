-- Remove the foreign key constraint on session_id in chat_messages table
-- to allow flexible session IDs for individual user chats
ALTER TABLE public.chat_messages DROP CONSTRAINT IF EXISTS chat_messages_session_id_fkey;

-- Make session_id nullable to allow messages without specific session context
ALTER TABLE public.chat_messages ALTER COLUMN session_id DROP NOT NULL;