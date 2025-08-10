-- Drop the individuals table and all dependencies - corrected order

-- First drop the trigger that depends on the function
DROP TRIGGER IF EXISTS on_auth_user_created_individual ON auth.users;

-- Then drop the function
DROP FUNCTION IF EXISTS public.handle_new_individual_user() CASCADE;

-- Drop tables that reference individuals table
DROP TABLE IF EXISTS individual_conversations CASCADE;
DROP TABLE IF EXISTS individual_bookings CASCADE;
DROP TABLE IF EXISTS individual_payments CASCADE;
DROP TABLE IF EXISTS individual_profiles CASCADE;
DROP TABLE IF EXISTS individual_services CASCADE;

-- Drop the main individuals table
DROP TABLE IF EXISTS individuals CASCADE;

-- Drop the individual_users table as well since it seems redundant
DROP TABLE IF EXISTS individual_users CASCADE;

-- Clean up any remaining individual-related tables
DROP TABLE IF EXISTS service_interactions CASCADE;
DROP TABLE IF EXISTS pending_messages CASCADE;