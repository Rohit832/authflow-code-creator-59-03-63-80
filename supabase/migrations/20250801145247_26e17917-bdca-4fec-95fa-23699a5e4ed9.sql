-- Update admin email addresses to include the actual Gmail address
UPDATE admin_permissions SET email = 'rohitsaw835@gmail.com' WHERE email = 'admin@finsageconsult.com';

-- Insert additional admin email if needed
INSERT INTO admin_permissions (email, is_approved) 
VALUES ('rohitsaw833@gmail.com', true)
ON CONFLICT (email) DO NOTHING;