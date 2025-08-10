-- Update the check constraint to allow 'individual' user type
ALTER TABLE password_reset_otps 
DROP CONSTRAINT password_reset_otps_user_type_check;

ALTER TABLE password_reset_otps 
ADD CONSTRAINT password_reset_otps_user_type_check 
CHECK (user_type = ANY (ARRAY['admin'::text, 'client'::text, 'individual'::text]));