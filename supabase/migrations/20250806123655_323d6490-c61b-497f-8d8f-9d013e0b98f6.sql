-- Ensure client_registrations table has proper constraints and indexes for data persistence
-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_client_registrations_status ON public.client_registrations(status);
CREATE INDEX IF NOT EXISTS idx_client_registrations_email ON public.client_registrations(email);
CREATE INDEX IF NOT EXISTS idx_client_registrations_access_code ON public.client_registrations(access_code);

-- Create trigger to automatically generate access code when registration is approved
CREATE OR REPLACE FUNCTION public.generate_access_code_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate access code when status changes to 'approved' and access_code is null
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.access_code IS NULL THEN
    NEW.access_code = public.generate_access_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic access code generation
DROP TRIGGER IF EXISTS trigger_generate_access_code ON public.client_registrations;
CREATE TRIGGER trigger_generate_access_code
  BEFORE UPDATE ON public.client_registrations
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_access_code_on_approval();

-- Add NOT NULL constraint to ensure data integrity for required fields
-- (This will help ensure permanent storage)
ALTER TABLE public.client_registrations 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN status SET NOT NULL;