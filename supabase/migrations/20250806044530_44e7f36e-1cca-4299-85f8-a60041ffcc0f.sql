-- Create separate authentication tables for each user type
-- Remove the unified profiles table dependency

-- Create clients table with authentication
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  company_name TEXT,
  job_title TEXT,
  avatar_url TEXT,
  address TEXT,
  city TEXT,
  state_province TEXT,
  country TEXT,
  postal_code TEXT,
  date_of_birth DATE,
  gender TEXT,
  annual_income_range TEXT,
  investment_experience TEXT,
  risk_tolerance TEXT,
  investment_goals TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  linkedin_profile TEXT,
  preferred_language TEXT DEFAULT 'English',
  client_status TEXT DEFAULT 'active',
  referral_source TEXT,
  notes TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create individuals table with authentication
CREATE TABLE IF NOT EXISTS public.individuals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  date_of_birth DATE,
  gender TEXT,
  occupation TEXT,
  education_level TEXT,
  financial_goals TEXT,
  experience_level TEXT DEFAULT 'beginner',
  preferred_language TEXT DEFAULT 'English',
  learning_preferences JSONB DEFAULT '{}',
  timezone TEXT,
  status TEXT DEFAULT 'active',
  subscription_tier TEXT DEFAULT 'free',
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admins table with authentication
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  role_title TEXT,
  department TEXT,
  permissions JSONB DEFAULT '{}',
  is_super_admin BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Clients can view their own data" 
ON public.clients 
FOR ALL 
USING (id = auth.uid());

-- RLS Policies for individuals
CREATE POLICY "Individuals can view their own data" 
ON public.individuals 
FOR ALL 
USING (id = auth.uid());

-- RLS Policies for admins
CREATE POLICY "Admins can view their own data" 
ON public.admins 
FOR ALL 
USING (id = auth.uid());

CREATE POLICY "Super admins can view all admin data" 
ON public.admins 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.admins 
  WHERE id = auth.uid() AND is_super_admin = true
));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_individuals_email ON public.individuals(email);
CREATE INDEX IF NOT EXISTS idx_admins_email ON public.admins(email);

-- Create updated_at triggers
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individuals_updated_at
  BEFORE UPDATE ON public.individuals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create password hashing function
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create password verification function
CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;