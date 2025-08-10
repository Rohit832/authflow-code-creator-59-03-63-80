-- Add read_by column to messages table (read_at already exists)
ALTER TABLE public.messages ADD COLUMN read_by TEXT[];

-- Create typing indicators table
CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('client', 'admin')),
  is_typing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for typing indicators
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for typing indicators
CREATE POLICY "Users can view typing indicators in their conversations" 
ON public.typing_indicators 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own typing indicators" 
ON public.typing_indicators 
FOR ALL 
USING (auth.uid()::text = user_id OR auth.uid() IN (
  SELECT client_id FROM public.conversations WHERE id = conversation_id
) OR auth.uid() IN (
  SELECT admin_id FROM public.conversations WHERE id = conversation_id
));

-- Create function to clean up old typing indicators
CREATE OR REPLACE FUNCTION cleanup_typing_indicators() 
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < now() - interval '30 seconds';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update typing indicator timestamps
CREATE OR REPLACE FUNCTION update_typing_indicator_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_typing_indicators_updated_at
  BEFORE UPDATE ON public.typing_indicators
  FOR EACH ROW
  EXECUTE FUNCTION update_typing_indicator_timestamp();

-- Create indexes for better performance
CREATE INDEX idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);
CREATE INDEX idx_typing_indicators_user_id ON public.typing_indicators(user_id);
CREATE INDEX idx_typing_indicators_updated_at ON public.typing_indicators(updated_at);
CREATE INDEX idx_messages_read_at ON public.messages(read_at);

-- Function to automatically mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(
  p_conversation_id UUID,
  p_user_id UUID,
  p_user_type TEXT
) RETURNS void AS $$
BEGIN
  UPDATE public.messages 
  SET 
    read_at = CASE WHEN read_at IS NULL THEN now() ELSE read_at END,
    read_by = CASE 
      WHEN read_by IS NULL THEN ARRAY[p_user_id::text]
      WHEN NOT (p_user_id::text = ANY(read_by)) THEN array_append(read_by, p_user_id::text)
      ELSE read_by
    END
  WHERE conversation_id = p_conversation_id 
    AND sender_type != p_user_type 
    AND (read_at IS NULL OR NOT (p_user_id::text = ANY(read_by)));
END;
$$ LANGUAGE plpgsql;