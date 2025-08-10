-- Fix the hash_password function to properly handle the gen_salt function
-- First ensure pgcrypto extension is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop and recreate the function with proper syntax
DROP FUNCTION IF EXISTS public.hash_password(text);

CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Use crypt with gen_salt for bcrypt hashing
  RETURN crypt(password, gen_salt('bf', 8));
END;
$function$;