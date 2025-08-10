-- Add service_type column to credit_requests table
ALTER TABLE public.credit_requests 
ADD COLUMN service_type TEXT;