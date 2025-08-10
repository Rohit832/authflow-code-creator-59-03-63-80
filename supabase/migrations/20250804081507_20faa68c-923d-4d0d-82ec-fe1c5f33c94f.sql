-- Create tables for individual services management

-- Create service categories enum
CREATE TYPE service_category AS ENUM ('coaching', 'tools', 'programs');

-- Create individual services table
CREATE TABLE public.individual_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  duration TEXT,
  category service_category NOT NULL,
  features TEXT[],
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.individual_services ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage individual services" 
ON public.individual_services 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND user_type = 'admin'
));

CREATE POLICY "Anyone can view active individual services" 
ON public.individual_services 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_individual_services_updated_at
BEFORE UPDATE ON public.individual_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data based on the image
INSERT INTO public.individual_services (title, description, price, duration, category, features) VALUES
-- 1-on-1 Personal Coaching
('Tax Confusion', 'Get clarity on tax planning, deductions, and strategies to minimize your tax burden.', 2999, '60 mins', 'coaching', ARRAY['Tax planning strategies', 'Deduction optimization', 'Tax burden minimization']),
('Salary Planning', 'Learn to structure your salary for maximum savings and tax benefits.', 2499, '60 mins', 'coaching', ARRAY['Salary structuring', 'Tax benefit optimization', 'Savings maximization']),
('Goal-Based Savings', 'Plan for your home, trip, wedding, or any major life goal.', 3499, '90 mins', 'coaching', ARRAY['Goal planning', 'Savings strategy', 'Financial milestones']),
('Smart Investments', 'Make your first smart investment with confidence and knowledge.', 3999, '75 mins', 'coaching', ARRAY['Investment basics', 'Risk assessment', 'Portfolio planning']),
('Financial Anxiety', 'Overcome money-related stress and build healthy financial habits.', 2799, '60 mins', 'coaching', ARRAY['Stress management', 'Habit building', 'Financial mindset']),
('Complete Package', 'All 5 coaching sessions at a discounted price.', 12999, '5 Sessions', 'coaching', ARRAY['All coaching sessions', 'Comprehensive support', 'Best value package']),

-- Self-Guided Tools
('Financial Tools Bundle', 'Designed to save you time, stress, and guesswork.', 1499, NULL, 'tools', ARRAY['Insurance buying checklist', 'EMI planning calculator', 'Monthly budget tracker', 'Tax-saving checklist']),
('Premium Tools + Support', 'All basic tools plus advanced features and support.', 2999, NULL, 'tools', ARRAY['All basic tools', 'Advanced calculators', '30-day email support', 'Monthly updates']),

-- Short Programs
('Learn Investing', 'Master the basics of smart investing in just 3 hours.', 1999, '3 hours', 'programs', ARRAY['Investment fundamentals', 'Market basics', 'Strategy development']),
('Salary to SIP', 'Transform your salary into systematic investments.', 1499, '2 hours', 'programs', ARRAY['SIP planning', 'Salary optimization', 'Automatic investing']),
('Tax Mastery', 'From tax panic to peace in just 60 minutes.', 999, '60 mins', 'programs', ARRAY['Tax fundamentals', 'Quick strategies', 'Peace of mind']),
('First-Time Investors', 'Complete beginner''s guide to financial planning.', 2499, '4 hours', 'programs', ARRAY['Beginner friendly', 'Step-by-step guide', 'Foundation building']),
('Money & Mental Health', 'Build a healthy relationship with money.', 1799, '90 mins', 'programs', ARRAY['Mental health focus', 'Money mindset', 'Stress reduction']),
('All Programs Bundle', 'Access to all our short programs at a special price.', 5999, '12+ hours', 'programs', ARRAY['All programs included', 'Comprehensive learning', 'Best value package']);

-- Update some records to mark popular items
UPDATE public.individual_services SET is_popular = true WHERE title IN ('Complete Package', 'All Programs Bundle');

-- Update original prices for discounted items
UPDATE public.individual_services SET original_price = 15795 WHERE title = 'Complete Package';
UPDATE public.individual_services SET original_price = 8795 WHERE title = 'All Programs Bundle';