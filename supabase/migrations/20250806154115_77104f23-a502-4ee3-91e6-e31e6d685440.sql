-- Fix RLS policy for messages table to properly handle individual conversations
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;

-- Create updated policy that handles both individual and client conversations
CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id 
  AND (
    -- For individual conversations
    (individual_conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM individual_conversations 
      WHERE individual_conversations.id = messages.individual_conversation_id 
      AND (individual_conversations.individual_id = auth.uid() OR individual_conversations.admin_id = auth.uid())
    ))
    OR
    -- For client conversations  
    (client_conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM client_conversations 
      WHERE client_conversations.id = messages.client_conversation_id 
      AND (client_conversations.client_id = auth.uid() OR client_conversations.admin_id = auth.uid())
    ))
    OR
    -- For legacy conversations table
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.admin_id = auth.uid())
    ))
    OR
    -- Allow admins to create messages in any conversation
    is_admin(auth.uid())
  )
);

-- Also update the SELECT policy to handle individual conversations properly
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON public.messages;

CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  -- For individual conversations
  (individual_conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM individual_conversations 
    WHERE individual_conversations.id = messages.individual_conversation_id 
    AND (individual_conversations.individual_id = auth.uid() OR individual_conversations.admin_id = auth.uid())
  ))
  OR
  -- For client conversations
  (client_conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM client_conversations 
    WHERE client_conversations.id = messages.client_conversation_id 
    AND (client_conversations.client_id = auth.uid() OR client_conversations.admin_id = auth.uid())
  ))
  OR
  -- For legacy conversations table
  (conversation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (conversations.client_id = auth.uid() OR conversations.admin_id = auth.uid())
  ))
  OR
  -- Allow admins to view all messages
  is_admin(auth.uid())
);