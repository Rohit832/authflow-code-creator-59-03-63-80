-- Add credits for the approved requests for user 886d11e8-35c1-40dc-9b9f-cc0effff0a06
-- First, add the 1000 credits for short_session from the first approved request
INSERT INTO public.credits (user_id, amount, service_type) 
VALUES ('886d11e8-35c1-40dc-9b9f-cc0effff0a06', 1000, 'short_session');

-- Then add the 232 credits for short_session from the second approved request
UPDATE public.credits 
SET amount = amount + 232 
WHERE user_id = '886d11e8-35c1-40dc-9b9f-cc0effff0a06' AND service_type = 'short_session';