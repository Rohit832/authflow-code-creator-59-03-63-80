-- Create one_on_one_sessions table
CREATE TABLE public.one_on_one_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_inr INTEGER NOT NULL,
  duration TEXT,
  thumbnail_url TEXT,
  access_type TEXT DEFAULT 'premium',
  is_active BOOLEAN DEFAULT true,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create short_programs table
CREATE TABLE public.short_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_inr INTEGER NOT NULL,
  duration TEXT,
  thumbnail_url TEXT,
  access_type TEXT DEFAULT 'premium',
  is_active BOOLEAN DEFAULT true,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create financial_tools table
CREATE TABLE public.financial_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price_inr INTEGER NOT NULL,
  duration TEXT,
  thumbnail_url TEXT,
  access_type TEXT DEFAULT 'premium',
  is_active BOOLEAN DEFAULT true,
  admin_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create individual_purchases table
CREATE TABLE public.individual_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('one_on_one', 'short_program', 'financial_tool')),
  amount_paid INTEGER NOT NULL,
  payment_method TEXT DEFAULT 'credits',
  status TEXT DEFAULT 'purchased' CHECK (status IN ('purchased', 'cancelled')),
  can_rebook BOOLEAN DEFAULT true,
  purchase_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  cancellation_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.one_on_one_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.short_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for admin management
CREATE POLICY "Admins can manage one_on_one_sessions" ON public.one_on_one_sessions
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active one_on_one_sessions" ON public.one_on_one_sessions
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage short_programs" ON public.short_programs
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active short_programs" ON public.short_programs
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage financial_tools" ON public.financial_tools
FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active financial_tools" ON public.financial_tools
FOR SELECT USING (is_active = true);

-- Policies for purchases
CREATE POLICY "Admins can view all purchases" ON public.individual_purchases
FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own purchases" ON public.individual_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases" ON public.individual_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" ON public.individual_purchases
FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_one_on_one_sessions_updated_at
  BEFORE UPDATE ON public.one_on_one_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_short_programs_updated_at
  BEFORE UPDATE ON public.short_programs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_tools_updated_at
  BEFORE UPDATE ON public.financial_tools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_purchases_updated_at
  BEFORE UPDATE ON public.individual_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();