-- Create session_bookings table to track user session purchases
CREATE TABLE public.session_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'booked',
  credits_used INTEGER NOT NULL DEFAULT 1,
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Enable RLS
ALTER TABLE public.session_bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for session bookings
CREATE POLICY "Users can view their own bookings" 
ON public.session_bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" 
ON public.session_bookings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" 
ON public.session_bookings 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" 
ON public.session_bookings 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'::user_type
));

CREATE POLICY "Admins can update all bookings" 
ON public.session_bookings 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'::user_type
));

-- Add trigger for updated_at
CREATE TRIGGER update_session_bookings_updated_at
BEFORE UPDATE ON public.session_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();