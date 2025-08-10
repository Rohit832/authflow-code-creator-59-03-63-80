-- Insert the individual user record for testing
INSERT INTO individual_users (id, email, full_name, phone_number, status)
VALUES (
  '3f7b32cd-fe95-4f8c-b33f-bf75f647914c', -- This should match the auth.users id
  'rohitsaw2180@gmail.com',
  'Rohit Kumar Saw',
  NULL,
  'active'
)
ON CONFLICT (email) DO NOTHING;