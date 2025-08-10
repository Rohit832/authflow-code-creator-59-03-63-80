-- Fix the hash_password function with proper search_path
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions'
AS $$
BEGIN
  -- Use crypt with gen_salt for bcrypt hashing
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$;

-- Also ensure the pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;