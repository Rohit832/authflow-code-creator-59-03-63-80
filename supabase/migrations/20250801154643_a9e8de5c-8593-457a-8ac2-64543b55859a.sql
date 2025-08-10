-- Add service_type column to credits table to track credits per service
ALTER TABLE public.credits ADD COLUMN service_type text;

-- Update existing credits to be general/total credits
UPDATE public.credits SET service_type = 'total' WHERE service_type IS NULL;

-- Make service_type required
ALTER TABLE public.credits ALTER COLUMN service_type SET NOT NULL;

-- Add unique constraint to ensure one credit record per user per service type
ALTER TABLE public.credits ADD CONSTRAINT credits_user_service_unique UNIQUE (user_id, service_type);

-- Create index for better performance
CREATE INDEX idx_credits_user_service ON public.credits (user_id, service_type);