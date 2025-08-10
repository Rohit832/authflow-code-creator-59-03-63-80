-- Fix security warning by updating function with proper search path
CREATE OR REPLACE FUNCTION public.generate_access_code_on_approval()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only generate access code when status changes to 'approved' and access_code is null
  IF NEW.status = 'approved' AND OLD.status != 'approved' AND NEW.access_code IS NULL THEN
    NEW.access_code = public.generate_access_code();
  END IF;
  RETURN NEW;
END;
$$;