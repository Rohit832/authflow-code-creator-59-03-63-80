-- Create the missing hash_password function that uses bcrypt
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create or replace the hash_password function
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Use crypt with gen_salt for bcrypt hashing
  RETURN crypt(password, gen_salt('bf', 8));
END;
$function$;

-- Ensure the verify_password function exists and works correctly
CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  RETURN hash = crypt(password, hash);
END;
$function$;