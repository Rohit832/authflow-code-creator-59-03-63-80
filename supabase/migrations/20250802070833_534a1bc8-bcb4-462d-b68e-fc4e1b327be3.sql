-- Fix function search_path issues for security
ALTER FUNCTION public.generate_access_code() SET search_path = '';
ALTER FUNCTION public.generate_otp() SET search_path = '';
ALTER FUNCTION public.cleanup_typing_indicators() SET search_path = '';