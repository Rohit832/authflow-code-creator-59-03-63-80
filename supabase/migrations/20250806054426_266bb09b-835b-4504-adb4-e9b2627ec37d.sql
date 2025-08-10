-- Remove shared profiles table and update RLS policies for separate user types

-- First, update all RLS policies that reference the profiles table to use direct table checks

-- Update admin_permissions policies
DROP POLICY IF EXISTS "Admins can insert admin permissions" ON admin_permissions;
DROP POLICY IF EXISTS "Admins can update admin permissions" ON admin_permissions;  
DROP POLICY IF EXISTS "Admins can view admin permissions" ON admin_permissions;

CREATE POLICY "Admins can insert admin permissions" ON admin_permissions
FOR INSERT TO authenticated
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update admin permissions" ON admin_permissions  
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view admin permissions" ON admin_permissions
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update client_profiles policies
DROP POLICY IF EXISTS "Admins can update client profiles" ON client_profiles;
DROP POLICY IF EXISTS "Admins can view all client profiles" ON client_profiles;

CREATE POLICY "Admins can update client profiles" ON client_profiles
FOR UPDATE TO authenticated  
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all client profiles" ON client_profiles
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update client_registrations policies
DROP POLICY IF EXISTS "Admins can update client registrations" ON client_registrations;
DROP POLICY IF EXISTS "Admins can view all client registrations" ON client_registrations;

CREATE POLICY "Admins can update client registrations" ON client_registrations
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all client registrations" ON client_registrations  
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update coach_schedules policies
DROP POLICY IF EXISTS "Admins can manage all coach schedules" ON coach_schedules;

CREATE POLICY "Admins can manage all coach schedules" ON coach_schedules
FOR ALL TO authenticated
USING (is_admin(auth.uid()));

-- Update coaches policies  
DROP POLICY IF EXISTS "Admins can manage all coaches" ON coaches;

CREATE POLICY "Admins can manage all coaches" ON coaches
FOR ALL TO authenticated
USING (is_admin(auth.uid()));

-- Update conversations policies
DROP POLICY IF EXISTS "Admins can update conversations" ON conversations;
DROP POLICY IF EXISTS "Admins can view all conversations" ON conversations;

CREATE POLICY "Admins can update conversations" ON conversations
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all conversations" ON conversations
FOR SELECT TO authenticated  
USING (is_admin(auth.uid()));

-- Update credit_requests policies
DROP POLICY IF EXISTS "Admins can update credit requests" ON credit_requests;
DROP POLICY IF EXISTS "Admins can view all credit requests" ON credit_requests;

CREATE POLICY "Admins can update credit requests" ON credit_requests
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all credit requests" ON credit_requests
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update credits policies  
DROP POLICY IF EXISTS "Admins can view all credits" ON credits;

CREATE POLICY "Admins can view all credits" ON credits
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update individual_bookings policies
DROP POLICY IF EXISTS "Admins can view all individual bookings" ON individual_bookings;

CREATE POLICY "Admins can view all individual bookings" ON individual_bookings
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update individual_payments policies
DROP POLICY IF EXISTS "Admins can view all individual payments" ON individual_payments;

CREATE POLICY "Admins can view all individual payments" ON individual_payments  
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update individual_profiles policies
DROP POLICY IF EXISTS "Admins can view individual profiles" ON individual_profiles;

CREATE POLICY "Admins can view individual profiles" ON individual_profiles
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update individual_services policies
DROP POLICY IF EXISTS "Admins can manage individual services" ON individual_services;

CREATE POLICY "Admins can manage individual services" ON individual_services
FOR ALL TO authenticated  
USING (is_admin(auth.uid()));

-- Update individual_users policies
DROP POLICY IF EXISTS "Admins can view all individual users" ON individual_users;

CREATE POLICY "Admins can view all individual users" ON individual_users
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update inquiries policies
DROP POLICY IF EXISTS "Admins can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Admins can view all inquiries" ON inquiries;

CREATE POLICY "Admins can update inquiries" ON inquiries
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all inquiries" ON inquiries
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update messages policies (complex one that checks conversations)
DROP POLICY IF EXISTS "Users can create messages in their conversations" ON messages;
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

CREATE POLICY "Users can create messages in their conversations" ON messages
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE conversations.id = messages.conversation_id 
    AND (
      conversations.client_id = auth.uid() OR 
      conversations.admin_id = auth.uid() OR 
      is_admin(auth.uid())
    )
  )
);

CREATE POLICY "Users can view messages in their conversations" ON messages  
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversations
    WHERE conversations.id = messages.conversation_id
    AND (
      conversations.client_id = auth.uid() OR
      conversations.admin_id = auth.uid() OR  
      is_admin(auth.uid())
    )
  )
);

-- Update notification_logs policies
DROP POLICY IF EXISTS "Admins can view all notification logs" ON notification_logs;

CREATE POLICY "Admins can view all notification logs" ON notification_logs
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update pending_messages policies  
DROP POLICY IF EXISTS "Admins can update pending messages" ON pending_messages;
DROP POLICY IF EXISTS "Admins can view all pending messages" ON pending_messages;

CREATE POLICY "Admins can update pending messages" ON pending_messages
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all pending messages" ON pending_messages
FOR SELECT TO authenticated  
USING (is_admin(auth.uid()));

-- Update service_interactions policies
DROP POLICY IF EXISTS "Admins can view all service interactions" ON service_interactions;

CREATE POLICY "Admins can view all service interactions" ON service_interactions
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update service_plans policies
DROP POLICY IF EXISTS "Admins can manage service plans" ON service_plans;

CREATE POLICY "Admins can manage service plans" ON service_plans
FOR ALL TO authenticated
USING (is_admin(auth.uid()));

-- Update session_bookings policies  
DROP POLICY IF EXISTS "Admins can update all bookings" ON session_bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON session_bookings;

CREATE POLICY "Admins can update all bookings" ON session_bookings
FOR UPDATE TO authenticated
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all bookings" ON session_bookings
FOR SELECT TO authenticated
USING (is_admin(auth.uid()));

-- Update session_scheduling policies
DROP POLICY IF EXISTS "Admins can manage all session scheduling" ON session_scheduling;

CREATE POLICY "Admins can manage all session scheduling" ON session_scheduling  
FOR ALL TO authenticated
USING (is_admin(auth.uid()));

-- Now drop the profiles table since it's no longer needed
DROP TABLE IF EXISTS profiles CASCADE;

-- Add any missing essential fields to ensure each table is complete

-- Ensure admins table has role field (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'role') THEN
    ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'admin';
  END IF;
END $$;

-- Ensure individuals table has role field (if not exists)  
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'individuals' AND column_name = 'role') THEN
    ALTER TABLE individuals ADD COLUMN role TEXT DEFAULT 'individual';
  END IF;
END $$;

-- Ensure clients table has role field (if not exists)
DO $$
BEGIN  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'role') THEN
    ALTER TABLE clients ADD COLUMN role TEXT DEFAULT 'client';
  END IF;
END $$;