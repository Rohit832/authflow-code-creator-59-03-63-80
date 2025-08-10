-- Fix security warnings for password functions
CREATE OR REPLACE FUNCTION public.hash_password(password TEXT)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_password(password TEXT, hash TEXT)
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$$;