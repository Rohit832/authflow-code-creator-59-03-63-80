-- Fix RLS policies for admin messaging

-- Allow admins to create conversations
DROP POLICY IF EXISTS "Admins can create conversations" ON public.conversations;
CREATE POLICY "Admins can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Update the messages INSERT policy to be more permissive for admins
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON public.messages;
CREATE POLICY "Users can create messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() = sender_id) AND 
  (
    -- Allow if admin is sending the message
    is_admin(auth.uid()) OR
    -- Or if user is part of the conversation
    (EXISTS ( 
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND (conversations.client_id = auth.uid() OR conversations.admin_id = auth.uid())
    ))
  )
);