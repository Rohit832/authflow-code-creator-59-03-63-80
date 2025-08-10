-- Fix password hashing - simple implementation without pgcrypto
-- Since the existing password is stored as plain text, we'll update the functions to handle this

-- Update the simple_hash_password function to return a basic hash
CREATE OR REPLACE FUNCTION public.simple_hash_password(password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT encode(digest(password || 'finsage_salt_2024', 'sha256'), 'hex');
$function$;

-- Update the verify_password function to handle both plain text and hashed passwords
CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- First check if it's plain text (backward compatibility)
  IF hash = password THEN
    RETURN true;
  END IF;
  
  -- Then check if it's our hashed format
  RETURN hash = encode(digest(password || 'finsage_salt_2024', 'sha256'), 'hex');
END;
$function$;