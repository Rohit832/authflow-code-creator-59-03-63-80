-- Create individual user system tables

-- Individual profiles table
CREATE TABLE public.individual_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;

-- Individual sessions table
CREATE TABLE public.individual_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('one-on-one', 'short-program', 'self-guided-tool')),
  duration TEXT,
  price_inr INTEGER NOT NULL,
  tags TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_id UUID
);

-- Enable RLS
ALTER TABLE public.individual_sessions ENABLE ROW LEVEL SECURITY;

-- Session purchases table
CREATE TABLE public.session_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.individual_sessions(id),
  status TEXT NOT NULL DEFAULT 'purchased' CHECK (status IN ('purchased', 'cancelled')),
  purchase_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cancellation_date TIMESTAMP WITH TIME ZONE,
  can_rebook BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_purchases ENABLE ROW LEVEL SECURITY;

-- Chat messages table for individual sessions
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID,
  session_id UUID NOT NULL REFERENCES public.individual_sessions(id),
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('individual', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for individual_profiles
CREATE POLICY "Individuals can view their own profile" 
ON public.individual_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can insert their own profile" 
ON public.individual_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Individuals can update their own profile" 
ON public.individual_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all individual profiles" 
ON public.individual_profiles 
FOR SELECT 
USING (is_admin(auth.uid()));

-- RLS Policies for individual_sessions
CREATE POLICY "Anyone can view active sessions" 
ON public.individual_sessions 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage all sessions" 
ON public.individual_sessions 
FOR ALL 
USING (is_admin(auth.uid()));

-- RLS Policies for session_purchases
CREATE POLICY "Users can view their own purchases" 
ON public.session_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" 
ON public.session_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
ON public.session_purchases 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" 
ON public.session_purchases 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all purchases" 
ON public.session_purchases 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages for their sessions" 
ON public.chat_messages 
FOR SELECT 
USING (
  auth.uid() = sender_id OR 
  auth.uid() = receiver_id OR
  is_admin(auth.uid())
);

CREATE POLICY "Users can insert messages for their sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Admins can view all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_individual_profiles_updated_at
BEFORE UPDATE ON public.individual_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_sessions_updated_at
BEFORE UPDATE ON public.individual_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_purchases_updated_at
BEFORE UPDATE ON public.session_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();