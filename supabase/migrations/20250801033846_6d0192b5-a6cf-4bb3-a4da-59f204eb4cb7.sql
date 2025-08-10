-- Create table for storing OTPs
CREATE TABLE public.password_reset_otps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'client')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_otps ENABLE ROW LEVEL SECURITY;

-- Create policy for the edge function to manage OTPs
CREATE POLICY "Service role can manage OTPs" 
ON public.password_reset_otps 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to generate random 6-digit OTP
CREATE OR REPLACE FUNCTION public.generate_otp()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Create trigger for updating timestamp
CREATE TRIGGER update_password_reset_otps_updated_at
BEFORE UPDATE ON public.password_reset_otps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_password_reset_otps_email_code ON public.password_reset_otps(email, otp_code);
CREATE INDEX idx_password_reset_otps_expires_at ON public.password_reset_otps(expires_at);