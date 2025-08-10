-- Add credits for the approved requests for user 886d11e8-35c1-40dc-9b9f-cc0effff0a06
INSERT INTO public.credits (user_id, amount, service_type) 
VALUES 
  ('886d11e8-35c1-40dc-9b9f-cc0effff0a06', 232, 'short_session'),
  ('886d11e8-35c1-40dc-9b9f-cc0effff0a06', 1000, 'short_session')
ON CONFLICT (user_id, service_type) 
DO UPDATE SET amount = credits.amount + EXCLUDED.amount;