-- Drop the existing foreign key constraint from individual_payments to individual_users
ALTER TABLE individual_payments DROP CONSTRAINT individual_payments_user_id_fkey;

-- Add a new foreign key constraint to reference the individuals table instead
ALTER TABLE individual_payments ADD CONSTRAINT individual_payments_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES individuals(id) ON DELETE CASCADE;