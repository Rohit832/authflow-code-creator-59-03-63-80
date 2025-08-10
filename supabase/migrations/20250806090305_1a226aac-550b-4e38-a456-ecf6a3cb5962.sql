-- Check if hash_password function exists and create it if missing
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