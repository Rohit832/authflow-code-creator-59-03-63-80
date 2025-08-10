-- Fix the database trigger issue by removing the problematic trigger
-- that references non-existent individual_conversation_id field

-- Drop the trigger that's causing the error
DROP TRIGGER IF EXISTS update_individual_conversation_last_message_trigger ON public.messages;

-- Also clean up the function since it references tables/fields that don't exist
DROP FUNCTION IF EXISTS public.update_individual_conversation_last_message();