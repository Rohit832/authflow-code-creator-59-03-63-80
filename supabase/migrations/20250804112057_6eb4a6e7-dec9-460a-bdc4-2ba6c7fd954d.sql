-- Create separate profile tables for each user type

-- Client profiles table
CREATE TABLE public.client_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  company_name text,
  job_title text,
  phone_number text,
  address text,
  city text,
  state_province text,
  country text,
  postal_code text,
  date_of_birth date,
  gender text,
  annual_income_range text,
  investment_experience text,
  risk_tolerance text,
  investment_goals text,
  emergency_contact_name text,
  emergency_contact_phone text,
  linkedin_profile text,
  preferred_language text DEFAULT 'English',
  client_status text DEFAULT 'active',
  referral_source text,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Admin profiles table  
CREATE TABLE public.admin_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  avatar_url text,
  phone_number text,
  department text,
  role_title text,
  permissions jsonb DEFAULT '{}',
  last_login timestamp with time zone,
  is_super_admin boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Individual user profiles table (enhanced version of existing individual_users)
CREATE TABLE public.individual_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  phone_number text,
  date_of_birth date,
  gender text,
  occupation text,
  education_level text,
  financial_goals text,
  experience_level text DEFAULT 'beginner',
  preferred_language text DEFAULT 'English',
  learning_preferences jsonb DEFAULT '{}',
  timezone text,
  status text DEFAULT 'active',
  subscription_tier text DEFAULT 'free',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_profiles
CREATE POLICY "Clients can view their own profile" 
ON public.client_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Clients can update their own profile" 
ON public.client_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Clients can insert their own profile" 
ON public.client_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all client profiles" 
ON public.client_profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin'
));

CREATE POLICY "Admins can update client profiles" 
ON public.client_profiles 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin'
));

-- RLS Policies for admin_profiles
CREATE POLICY "Admins can view their own profile" 
ON public.admin_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their own profile" 
ON public.admin_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert their own profile" 
ON public.admin_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can view all admin profiles" 
ON public.admin_profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_profiles 
  WHERE user_id = auth.uid() AND is_super_admin = true
));

-- RLS Policies for individual_profiles
CREATE POLICY "Individuals can view their own profile" 
ON public.individual_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can update their own profile" 
ON public.individual_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Individuals can insert their own profile" 
ON public.individual_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view individual profiles" 
ON public.individual_profiles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin'
));

-- Create triggers for updated_at
CREATE TRIGGER update_client_profiles_updated_at
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_profiles_updated_at
  BEFORE UPDATE ON public.individual_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();