-- Create a table to store pending messages for bookings without assigned coaches
CREATE TABLE IF NOT EXISTS public.pending_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES individual_bookings(id),
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'client',
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transferred_to_conversation_id UUID NULL
);

-- Enable RLS
ALTER TABLE public.pending_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for pending messages
CREATE POLICY "Users can create their own pending messages" 
ON public.pending_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own pending messages" 
ON public.pending_messages 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all pending messages" 
ON public.pending_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));

CREATE POLICY "Admins can update pending messages" 
ON public.pending_messages 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));

-- Create an index on booking_id for better performance
CREATE INDEX IF NOT EXISTS idx_pending_messages_booking_id ON public.pending_messages(booking_id);

-- Create a function to transfer pending messages to a conversation when a coach is assigned
CREATE OR REPLACE FUNCTION public.transfer_pending_messages_to_conversation(
  p_booking_id UUID,
  p_conversation_id UUID
) RETURNS void AS $$
BEGIN
  -- Insert pending messages into the messages table
  INSERT INTO public.messages (conversation_id, sender_id, sender_type, content, message_type, created_at)
  SELECT 
    p_conversation_id,
    pm.user_id,
    pm.sender_type,
    pm.content,
    pm.message_type,
    pm.created_at
  FROM public.pending_messages pm
  WHERE pm.booking_id = p_booking_id 
    AND pm.transferred_to_conversation_id IS NULL;
  
  -- Mark the pending messages as transferred
  UPDATE public.pending_messages 
  SET transferred_to_conversation_id = p_conversation_id 
  WHERE booking_id = p_booking_id 
    AND transferred_to_conversation_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;