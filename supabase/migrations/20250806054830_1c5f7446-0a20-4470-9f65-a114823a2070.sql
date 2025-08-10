-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the admin record for the user who just tried to sign in
INSERT INTO admins (id, email, password_hash, full_name, role) 
VALUES (
  '7a22f4b2-9f7a-4398-b049-dbbdfd46db74', 
  'rohitsaw835@gmail.com', 
  crypt('Rohitsaw', gen_salt('bf', 8)), 
  'Rohit Saw', 
  'admin'
) 
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email, 
  password_hash = EXCLUDED.password_hash, 
  full_name = EXCLUDED.full_name;