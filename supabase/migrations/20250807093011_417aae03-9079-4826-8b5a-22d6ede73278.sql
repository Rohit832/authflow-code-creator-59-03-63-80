-- Create individual_bookings table for payment tracking
CREATE TABLE IF NOT EXISTS public.individual_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NULL,
  service_type TEXT NOT NULL DEFAULT 'consultation',
  payment_amount INTEGER NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'payment_pending',
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create individual_payments table for payment records
CREATE TABLE IF NOT EXISTS public.individual_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  booking_id UUID NULL,
  amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'razorpay',
  transaction_id TEXT NULL,
  service_type TEXT NOT NULL DEFAULT 'consultation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create individual_users table for user management
CREATE TABLE IF NOT EXISTS public.individual_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone_number TEXT NULL,
  password_hash TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.individual_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for individual_bookings
CREATE POLICY "Users can view their own bookings" 
ON public.individual_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.individual_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.individual_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" 
ON public.individual_bookings 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create RLS policies for individual_payments
CREATE POLICY "Users can view their own payments" 
ON public.individual_payments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.individual_payments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage payments" 
ON public.individual_payments 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all payments" 
ON public.individual_payments 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create RLS policies for individual_users
CREATE POLICY "Users can view their own profile" 
ON public.individual_users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.individual_users 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" 
ON public.individual_users 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all users" 
ON public.individual_users 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Create update triggers
CREATE TRIGGER update_individual_bookings_updated_at
BEFORE UPDATE ON public.individual_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_payments_updated_at
BEFORE UPDATE ON public.individual_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_individual_users_updated_at
BEFORE UPDATE ON public.individual_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();