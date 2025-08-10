-- Add some test credits to ensure the workflow works
INSERT INTO credits (user_id, service_type, amount) VALUES 
  ('98d496a3-7a3d-466a-8f61-d88ba7d7872b', 'coaching', 5),
  ('98d496a3-7a3d-466a-8f61-d88ba7d7872b', 'short_session', 3)
ON CONFLICT (user_id, service_type) DO UPDATE SET 
  amount = EXCLUDED.amount;