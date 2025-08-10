-- Fix security issues with database functions by setting proper search_path

-- Update cleanup_typing_indicators function
CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < now() - interval '30 seconds';
END;
$function$;

-- Update update_typing_indicator_timestamp function
CREATE OR REPLACE FUNCTION public.update_typing_indicator_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;