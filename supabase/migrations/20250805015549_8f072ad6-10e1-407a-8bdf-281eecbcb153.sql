-- Add service_type and service_id to individual_bookings to track tool purchases
ALTER TABLE public.individual_bookings ADD COLUMN service_type TEXT DEFAULT 'consultation';
ALTER TABLE public.individual_bookings ADD COLUMN service_id UUID REFERENCES public.individual_services(id);

-- Add service_type to individual_payments for better tracking
ALTER TABLE public.individual_payments ADD COLUMN service_type TEXT DEFAULT 'consultation';