
-- Create individual_users table to store individual user registrations
CREATE TABLE public.individual_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT,
  phone_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active'
);

-- Create service_plans table to store the different service types
CREATE TABLE public.service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL, -- '1on1', 'self_guided', 'short_programs'
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration TEXT,
  features TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create individual_bookings table to store bookings
CREATE TABLE public.individual_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.individual_users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.service_plans(id),
  coach_id UUID,
  session_date TIMESTAMPTZ,
  session_time TIME,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_amount DECIMAL(10,2),
  session_link TEXT,
  chat_room_id TEXT,
  status TEXT NOT NULL DEFAULT 'booked', -- booked, completed, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create individual_payments table to track payments
CREATE TABLE public.individual_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.individual_users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.individual_bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.individual_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.individual_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for individual_users
CREATE POLICY "Users can view their own profile" ON public.individual_users
  FOR SELECT USING (id = auth.uid()::uuid);

CREATE POLICY "Users can update their own profile" ON public.individual_users
  FOR UPDATE USING (id = auth.uid()::uuid);

CREATE POLICY "Anyone can create individual account" ON public.individual_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all individual users" ON public.individual_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for service_plans
CREATE POLICY "Anyone can view service plans" ON public.service_plans
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage service plans" ON public.service_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for individual_bookings
CREATE POLICY "Users can view their own bookings" ON public.individual_bookings
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can create their own bookings" ON public.individual_bookings
  FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own bookings" ON public.individual_bookings
  FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Admins can view all individual bookings" ON public.individual_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for individual_payments
CREATE POLICY "Users can view their own payments" ON public.individual_payments
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can create their own payments" ON public.individual_payments
  FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Admins can view all individual payments" ON public.individual_payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Insert sample service plans
INSERT INTO public.service_plans (plan_type, title, description, price, duration, features) VALUES
-- 1-on-1 Personal Training
('1on1', 'Tax confusion', 'Get personalized help with your tax questions', 2999.00, '60 mins', ARRAY['Private session', 'Expert guidance', 'Follow-up support']),
('1on1', 'Planning your salary better', 'Optimize your salary structure and benefits', 3499.00, '90 mins', ARRAY['Salary optimization', 'Tax planning', 'Investment advice']),
('1on1', 'Saving for a goal', 'Plan and save for home, trip, wedding or any major goal', 2999.00, '75 mins', ARRAY['Goal planning', 'Investment strategy', 'Timeline creation']),

-- Self Guided Programs
('self_guided', 'What to check before buying insurance', 'Comprehensive insurance buying guide', 1499.00, '4 weeks', ARRAY['Self-paced learning', 'Checklists', 'Resource library']),
('self_guided', 'How to plan an EMI smartly', 'Master EMI planning and management', 1299.00, '3 weeks', ARRAY['EMI calculator', 'Planning tools', 'Smart strategies']),
('self_guided', 'A monthly tracker that actually works', 'Build effective money tracking habits', 999.00, '2 weeks', ARRAY['Tracking templates', 'Habit building', 'Monthly reviews']),
('self_guided', 'Simple tax-saving checklist', 'Easy tax saving strategies and checklist', 799.00, '1 week', ARRAY['Tax checklist', 'Investment options', 'Documentation help']),

-- Short Programs
('short_programs', 'Learn investing in 3 hours', 'Quick start guide to investing basics', 1999.00, '3 hours', ARRAY['Live session', 'Q&A', 'Resource pack']),
('short_programs', 'Salary → SIP made simple', 'Convert salary to systematic investments', 1799.00, '2 hours', ARRAY['SIP setup', 'Auto-investment', 'Portfolio basics']),
('short_programs', 'Tax panic to peace in 60 mins', 'Quick tax filing and planning session', 1499.00, '60 mins', ARRAY['Tax basics', 'Filing help', 'Peace of mind']),
('short_programs', 'First-time investors', 'Perfect for investment beginners', 1999.00, '90 mins', ARRAY['Beginner friendly', 'Risk assessment', 'First investment']),
('short_programs', 'Tax season survival', 'Navigate tax season with confidence', 1299.00, '75 mins', ARRAY['Tax preparation', 'Document organization', 'Filing tips']),
('short_programs', 'Money & mental health', 'Healthy relationship with money', 1799.00, '90 mins', ARRAY['Stress management', 'Financial wellness', 'Mindful spending']);
