-- Fix password hashing with built-in PostgreSQL functions only
-- Update the simple_hash_password function to return a basic hash using built-in md5
CREATE OR REPLACE FUNCTION public.simple_hash_password(password text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT md5(password || 'finsage_salt_2024');
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
  
  -- Then check if it's our hashed format using md5
  RETURN hash = md5(password || 'finsage_salt_2024');
END;
$function$;