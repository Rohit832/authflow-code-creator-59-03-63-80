-- Update RLS policies for messages table to handle client_conversation_id

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert messages in their conversations" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

-- Create updated policies that handle both conversation_id and client_conversation_id
CREATE POLICY "Users can insert messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() = sender_id) AND (
    -- Check for regular conversations
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id 
      AND (c.client_id = auth.uid() OR c.admin_id = auth.uid())
    ))
    OR
    -- Check for client conversations
    (client_conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM client_conversations cc
      WHERE cc.id = messages.client_conversation_id 
      AND (cc.client_id = auth.uid() OR cc.admin_id = auth.uid())
    ))
  )
);

CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  -- Check for regular conversations
  (conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id 
    AND (c.client_id = auth.uid() OR c.admin_id = auth.uid())
  ))
  OR
  -- Check for client conversations
  (client_conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM client_conversations cc
    WHERE cc.id = messages.client_conversation_id 
    AND (cc.client_id = auth.uid() OR cc.admin_id = auth.uid())
  ))
);