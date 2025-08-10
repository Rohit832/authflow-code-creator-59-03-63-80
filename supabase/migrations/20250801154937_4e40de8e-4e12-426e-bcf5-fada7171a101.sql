-- Create separate credit records for each service type based on approved requests
INSERT INTO public.credits (user_id, amount, service_type)
VALUES 
  ('ed77ec16-7eca-4ca2-8c45-38eda4dd5e04', 46, 'coaching'),
  ('ed77ec16-7eca-4ca2-8c45-38eda4dd5e04', 23, 'short_session');