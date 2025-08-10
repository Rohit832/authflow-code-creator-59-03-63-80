-- Fix security issues: Update functions to have proper search_path
CREATE OR REPLACE FUNCTION public.update_client_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.client_conversation_id IS NOT NULL THEN
    UPDATE public.client_conversations 
    SET last_message_at = NOW()
    WHERE id = NEW.client_conversation_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_individual_conversation_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.individual_conversation_id IS NOT NULL THEN
    UPDATE public.individual_conversations 
    SET last_message_at = NOW()
    WHERE id = NEW.individual_conversation_id;
  END IF;
  RETURN NEW;
END;
$function$;