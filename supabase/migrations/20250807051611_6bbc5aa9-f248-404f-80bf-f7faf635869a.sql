-- Add RLS policies for messages table to allow proper messaging functionality

-- Policy to allow users to insert messages in conversations they're part of
CREATE POLICY "Users can insert messages in their conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.client_id = auth.uid() OR c.admin_id = auth.uid())
  )
);

-- Policy to allow users to select messages from conversations they're part of
CREATE POLICY "Users can view messages in their conversations" 
ON public.messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.client_id = auth.uid() OR c.admin_id = auth.uid())
  )
);

-- Policy to allow admins to manage all messages
CREATE POLICY "Admins can manage all messages" 
ON public.messages 
FOR ALL 
USING (is_admin(auth.uid()));