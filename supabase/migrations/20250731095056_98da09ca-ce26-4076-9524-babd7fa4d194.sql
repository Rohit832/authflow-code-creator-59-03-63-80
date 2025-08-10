-- Fix the security warning for generate_access_code function
CREATE OR REPLACE FUNCTION public.generate_access_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$function$;