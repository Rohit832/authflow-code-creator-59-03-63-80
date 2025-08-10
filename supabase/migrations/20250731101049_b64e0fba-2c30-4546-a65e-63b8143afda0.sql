-- Fix the security warning by setting search_path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- This function will be called after a user is created in auth.users
  -- It runs with elevated privileges so it can bypass RLS
  RETURN NEW;
END;
$function$;