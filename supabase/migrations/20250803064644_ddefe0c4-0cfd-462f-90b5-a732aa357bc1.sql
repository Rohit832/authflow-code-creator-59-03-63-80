-- Create inquiries table for demo requests and inquiries
CREATE TABLE public.inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  work_email TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT NOT NULL,
  company_size TEXT,
  country TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies for inquiries
CREATE POLICY "Anyone can insert inquiries" 
ON public.inquiries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all inquiries" 
ON public.inquiries 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'::user_type
));

CREATE POLICY "Admins can update inquiries" 
ON public.inquiries 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.user_type = 'admin'::user_type
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inquiries_updated_at
BEFORE UPDATE ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();