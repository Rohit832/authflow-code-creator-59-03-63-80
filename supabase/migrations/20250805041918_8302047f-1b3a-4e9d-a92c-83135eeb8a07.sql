-- Create coaches table
CREATE TABLE public.coaches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  specialty_tags TEXT[] DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  profile_image_url TEXT,
  bio TEXT,
  experience_years INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coach_schedules table
CREATE TABLE public.coach_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES public.coaches(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Enable Row Level Security
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for coaches table
CREATE POLICY "Admins can manage all coaches" 
ON public.coaches 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));

CREATE POLICY "Anyone can view active coaches" 
ON public.coaches 
FOR SELECT 
USING (is_available = true);

-- Create policies for coach_schedules table
CREATE POLICY "Admins can manage all coach schedules" 
ON public.coach_schedules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'
));

CREATE POLICY "Anyone can view active coach schedules" 
ON public.coach_schedules 
FOR SELECT 
USING (is_active = true);

-- Create trigger for automatic timestamp updates on coaches
CREATE TRIGGER update_coaches_updated_at
BEFORE UPDATE ON public.coaches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on coach_schedules
CREATE TRIGGER update_coach_schedules_updated_at
BEFORE UPDATE ON public.coach_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data
INSERT INTO public.coaches (name, email, phone_number, specialty_tags, is_available, bio, experience_years) VALUES
('Dr. Priya Sharma', 'priya.sharma@finsage.co', '+91-98765-43210', ARRAY['Investment Planning', 'Portfolio Management'], true, 'Investment Planning & Portfolio Management specialist with 8+ years experience', 8),
('Rajesh Kumar', 'rajesh.kumar@finsage.co', '+91-98765-43211', ARRAY['Tax Planning', 'Retirement Strategy'], true, 'Tax Planning & Retirement Strategy expert with 12+ years experience', 12),
('Anita Desai', 'anita.desai@finsage.co', '+91-98765-43212', ARRAY['SIP', 'Mutual Funds', 'Goal Planning'], true, 'SIP and Mutual Funds specialist focusing on goal-based planning', 6);

-- Insert sample schedules
INSERT INTO public.coach_schedules (coach_id, day_of_week, start_time, end_time) 
SELECT 
  c.id,
  generate_series(1, 5) as day_of_week, -- Monday to Friday
  '09:00'::TIME as start_time,
  '17:00'::TIME as end_time
FROM public.coaches c
WHERE c.email = 'priya.sharma@finsage.co';

INSERT INTO public.coach_schedules (coach_id, day_of_week, start_time, end_time) 
SELECT 
  c.id,
  generate_series(1, 6) as day_of_week, -- Monday to Saturday
  '10:00'::TIME as start_time,
  '18:00'::TIME as end_time
FROM public.coaches c
WHERE c.email = 'rajesh.kumar@finsage.co';