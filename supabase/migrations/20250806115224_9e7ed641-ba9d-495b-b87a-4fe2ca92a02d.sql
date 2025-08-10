-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Fix the simple_hash_password function to actually hash passwords
CREATE OR REPLACE FUNCTION public.simple_hash_password(password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT crypt(password, gen_salt('bf'));
$function$;

-- Fix the verify_password function
CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$function$;