-- Fix remaining function search_path issues 
ALTER FUNCTION public.mark_messages_as_read(uuid, uuid, text) SET search_path = '';
ALTER FUNCTION public.update_typing_indicator_timestamp() SET search_path = '';