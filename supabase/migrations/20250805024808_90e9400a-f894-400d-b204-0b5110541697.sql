-- First, let's add user activity tracking tables for comprehensive data storage

-- Create user_activity_logs table to track all user interactions
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL, -- 'page_view', 'service_view', 'booking_attempt', 'payment_attempt', 'payment_success', etc.
    activity_data JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    referrer_url TEXT,
    page_url TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_activity_logs
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage activity logs" 
ON public.user_activity_logs 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
));

-- Create service_interactions table to track user engagement with specific services
CREATE TABLE IF NOT EXISTS public.service_interactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    service_id UUID,
    service_type TEXT NOT NULL, -- 'coaching', 'tools', 'programs'
    interaction_type TEXT NOT NULL, -- 'view', 'click', 'share', 'bookmark'
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on service_interactions
ALTER TABLE public.service_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_interactions
CREATE POLICY "Users can view their own service interactions" 
ON public.service_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service interactions" 
ON public.service_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all service interactions" 
ON public.service_interactions 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
));

-- Add missing columns to individual_bookings for better tracking
ALTER TABLE public.individual_bookings 
ADD COLUMN IF NOT EXISTS booking_source TEXT DEFAULT 'dashboard',
ADD COLUMN IF NOT EXISTS referral_code TEXT,
ADD COLUMN IF NOT EXISTS utm_source TEXT,
ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
ADD COLUMN IF NOT EXISTS utm_medium TEXT,
ADD COLUMN IF NOT EXISTS user_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS rescheduled_from UUID; -- reference to previous booking if rescheduled

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_individual_bookings_user_id ON public.individual_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_bookings_status ON public.individual_bookings(status);
CREATE INDEX IF NOT EXISTS idx_individual_bookings_payment_status ON public.individual_bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_individual_bookings_created_at ON public.individual_bookings(created_at);

-- Add missing columns to individual_payments for better tracking
ALTER TABLE public.individual_payments 
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay',
ADD COLUMN IF NOT EXISTS gateway_order_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_payment_id TEXT,
ADD COLUMN IF NOT EXISTS gateway_signature TEXT,
ADD COLUMN IF NOT EXISTS payment_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS refund_status TEXT,
ADD COLUMN IF NOT EXISTS refund_initiated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS refund_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Add indexes for payments
CREATE INDEX IF NOT EXISTS idx_individual_payments_user_id ON public.individual_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_individual_payments_status ON public.individual_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_individual_payments_created_at ON public.individual_payments(created_at);
CREATE INDEX IF NOT EXISTS idx_individual_payments_booking_id ON public.individual_payments(booking_id);

-- Create session_scheduling table for detailed session management
CREATE TABLE IF NOT EXISTS public.session_scheduling (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.individual_bookings(id) ON DELETE CASCADE,
    coach_id UUID,
    preferred_date DATE,
    preferred_time TIME,
    preferred_timezone TEXT DEFAULT 'Asia/Kolkata',
    scheduled_date TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    session_type TEXT DEFAULT 'video_call', -- 'video_call', 'phone', 'in_person'
    session_platform TEXT DEFAULT 'meet', -- 'meet', 'zoom', 'teams'
    session_url TEXT,
    join_instructions TEXT,
    pre_session_notes TEXT,
    post_session_notes TEXT,
    session_rating INTEGER CHECK (session_rating >= 1 AND session_rating <= 5),
    session_feedback TEXT,
    coach_feedback TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on session_scheduling
ALTER TABLE public.session_scheduling ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_scheduling
CREATE POLICY "Users can view their own session scheduling" 
ON public.session_scheduling 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM individual_bookings 
    WHERE individual_bookings.id = session_scheduling.booking_id 
    AND individual_bookings.user_id = auth.uid()
));

CREATE POLICY "Users can update their own session scheduling" 
ON public.session_scheduling 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM individual_bookings 
    WHERE individual_bookings.id = session_scheduling.booking_id 
    AND individual_bookings.user_id = auth.uid()
));

CREATE POLICY "Admins can manage all session scheduling" 
ON public.session_scheduling 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
));

-- Add indexes for session_scheduling
CREATE INDEX IF NOT EXISTS idx_session_scheduling_booking_id ON public.session_scheduling(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_scheduling_coach_id ON public.session_scheduling(coach_id);
CREATE INDEX IF NOT EXISTS idx_session_scheduling_status ON public.session_scheduling(status);
CREATE INDEX IF NOT EXISTS idx_session_scheduling_scheduled_date ON public.session_scheduling(scheduled_date);

-- Create user_preferences table for storing user preferences and settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    preferred_communication_method TEXT DEFAULT 'email', -- 'email', 'sms', 'whatsapp'
    preferred_session_time TEXT DEFAULT 'evening', -- 'morning', 'afternoon', 'evening'
    preferred_coach_gender TEXT, -- 'male', 'female', 'no_preference'
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    language_preference TEXT DEFAULT 'English',
    accessibility_needs TEXT,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_preferences
CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all preferences" 
ON public.user_preferences 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
));

-- Add index for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Create notification_logs table to track all notifications sent
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    notification_type TEXT NOT NULL, -- 'email', 'sms', 'push', 'in_app'
    template_name TEXT,
    subject TEXT,
    content TEXT,
    recipient_info JSONB, -- email, phone, device_token etc
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
    external_id TEXT, -- ID from email/SMS service
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_logs
CREATE POLICY "Users can view their own notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage notification logs" 
ON public.notification_logs 
FOR ALL 
USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all notification logs" 
ON public.notification_logs 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
));

-- Add indexes for notification_logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON public.notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON public.notification_logs(created_at);

-- Update the updated_at trigger for new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_session_scheduling_updated_at
    BEFORE UPDATE ON public.session_scheduling
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to automatically create session_scheduling record when booking is created
CREATE OR REPLACE FUNCTION public.create_session_scheduling_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create scheduling record for consultation bookings
  IF NEW.service_type = 'consultation' THEN
    INSERT INTO public.session_scheduling (booking_id, status)
    VALUES (NEW.id, 'pending');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_create_session_scheduling
    AFTER INSERT ON public.individual_bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_session_scheduling_on_booking();