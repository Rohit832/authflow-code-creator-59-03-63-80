-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'client', 'pending');

-- Create user_roles table for proper role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_by uuid REFERENCES auth.users(id),
    assigned_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's primary role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE 
      WHEN role = 'admin' THEN 1
      WHEN role = 'client' THEN 2
      WHEN role = 'pending' THEN 3
    END
  LIMIT 1
$$;

-- Create trigger function to assign default 'pending' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'pending');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Update profiles table to remove user_type column and add computed role
ALTER TABLE public.profiles DROP COLUMN IF EXISTS user_type;

-- Update profiles RLS policies to check roles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can select profiles" ON public.profiles;

-- New profiles policies that check user roles
CREATE POLICY "Users with roles can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'client'))
);

CREATE POLICY "Users with roles can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id AND 
  (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'client'))
);

CREATE POLICY "Anyone can insert profile on signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Update client_registrations policies to use role system
DROP POLICY IF EXISTS "Admins can view all client registrations" ON public.client_registrations;
DROP POLICY IF EXISTS "Admins can update client registrations" ON public.client_registrations;

CREATE POLICY "Admins can view all client registrations" 
ON public.client_registrations 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update client registrations" 
ON public.client_registrations 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));