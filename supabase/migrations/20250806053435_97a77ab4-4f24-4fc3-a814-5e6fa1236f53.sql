-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update hash_password function to use pgcrypto properly
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Use crypt with gen_salt for bcrypt hashing
  RETURN crypt(password, gen_salt('bf', 8));
END;
$$;