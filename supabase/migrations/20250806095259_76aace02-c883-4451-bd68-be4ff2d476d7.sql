-- Update the is_admin function to reference admin_profiles instead of admins
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = $1 AND is_approved = true
  );
$function$;

-- Update the is_super_admin function to reference admin_profiles instead of admins
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = $1 AND is_super_admin = true
  );
$function$;