-- Create client_conversations table for client-to-admin conversations
CREATE TABLE public.client_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.client_profiles(user_id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.admin_profiles(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create individual_conversations table for individual-to-admin conversations  
CREATE TABLE public.individual_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  individual_id UUID NOT NULL REFERENCES public.individual_profiles(user_id) ON DELETE CASCADE,
  admin_id UUID REFERENCES public.admin_profiles(user_id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_conversations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_conversations
CREATE POLICY "Admins can view all client conversations" 
ON public.client_conversations 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create client conversations" 
ON public.client_conversations 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update client conversations" 
ON public.client_conversations 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Clients can view their own conversations" 
ON public.client_conversations 
FOR SELECT 
USING (auth.uid() = client_id);

CREATE POLICY "Clients can create their own conversations" 
ON public.client_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Create RLS policies for individual_conversations
CREATE POLICY "Admins can view all individual conversations" 
ON public.individual_conversations 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create individual conversations" 
ON public.individual_conversations 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update individual conversations" 
ON public.individual_conversations 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Individuals can view their own conversations" 
ON public.individual_conversations 
FOR SELECT 
USING (auth.uid() = individual_id);

CREATE POLICY "Individuals can create their own conversations" 
ON public.individual_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = individual_id);

-- Create indexes for better performance
CREATE INDEX idx_client_conversations_client_id ON public.client_conversations(client_id);
CREATE INDEX idx_client_conversations_admin_id ON public.client_conversations(admin_id);
CREATE INDEX idx_client_conversations_last_message ON public.client_conversations(last_message_at DESC);

CREATE INDEX idx_individual_conversations_individual_id ON public.individual_conversations(individual_id);
CREATE INDEX idx_individual_conversations_admin_id ON public.individual_conversations(admin_id);
CREATE INDEX idx_individual_conversations_last_message ON public.individual_conversations(last_message_at DESC);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_client_conversations_updated_at
BEFORE UPDATE ON public.client_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_conversations_updated_at
BEFORE UPDATE ON public.individual_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update messages table to handle both conversation types
-- Add columns to identify which conversation table to reference
ALTER TABLE public.messages ADD COLUMN conversation_type TEXT;
ALTER TABLE public.messages ADD COLUMN client_conversation_id UUID REFERENCES public.client_conversations(id) ON DELETE CASCADE;
ALTER TABLE public.messages ADD COLUMN individual_conversation_id UUID REFERENCES public.individual_conversations(id) ON DELETE CASCADE;

-- Create constraint to ensure exactly one conversation reference
ALTER TABLE public.messages ADD CONSTRAINT messages_conversation_check 
CHECK (
  (conversation_id IS NOT NULL AND client_conversation_id IS NULL AND individual_conversation_id IS NULL) OR
  (conversation_id IS NULL AND client_conversation_id IS NOT NULL AND individual_conversation_id IS NULL AND conversation_type = 'client') OR
  (conversation_id IS NULL AND individual_conversation_id IS NOT NULL AND client_conversation_id IS NULL AND conversation_type = 'individual')
);

-- Create functions to update last_message_at for new conversation tables
CREATE OR REPLACE FUNCTION public.update_client_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.client_conversation_id IS NOT NULL THEN
    UPDATE public.client_conversations 
    SET last_message_at = NOW()
    WHERE id = NEW.client_conversation_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_individual_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF NEW.individual_conversation_id IS NOT NULL THEN
    UPDATE public.individual_conversations 
    SET last_message_at = NOW()
    WHERE id = NEW.individual_conversation_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Create triggers for updating last_message_at
CREATE TRIGGER update_client_conversation_last_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_client_conversation_last_message();

CREATE TRIGGER update_individual_conversation_last_message_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.update_individual_conversation_last_message();