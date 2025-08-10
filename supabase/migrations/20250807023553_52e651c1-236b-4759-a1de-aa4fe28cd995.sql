-- Create function to handle new user signup for individuals
CREATE OR REPLACE FUNCTION public.handle_new_individual_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create individual record if user metadata indicates individual type
  IF NEW.raw_user_meta_data->>'user_type' = 'individual' OR 
     NEW.raw_user_meta_data ? 'full_name' THEN
    INSERT INTO public.individuals (
      id, 
      email, 
      password_hash,
      full_name, 
      phone_number
    )
    VALUES (
      NEW.id,
      NEW.email,
      '',  -- Password handled by Supabase Auth
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone_number', '')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic individual profile creation
DROP TRIGGER IF EXISTS on_auth_user_created_individual ON auth.users;
CREATE TRIGGER on_auth_user_created_individual
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_individual_user();