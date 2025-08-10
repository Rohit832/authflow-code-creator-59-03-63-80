-- Add foreign key constraint for plan_id in individual_bookings table
ALTER TABLE individual_bookings
ADD CONSTRAINT individual_bookings_plan_id_fkey 
FOREIGN KEY (plan_id) REFERENCES service_plans(id) ON DELETE SET NULL;