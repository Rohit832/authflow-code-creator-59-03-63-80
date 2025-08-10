
-- Create a table to manage admin permissions
CREATE TABLE public.admin_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Allow admins to view and manage admin permissions
CREATE POLICY "Admins can view admin permissions" 
  ON public.admin_permissions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  ));

CREATE POLICY "Admins can insert admin permissions" 
  ON public.admin_permissions 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  ));

CREATE POLICY "Admins can update admin permissions" 
  ON public.admin_permissions 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'admin'
  ));

-- Add trigger to update updated_at column
CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial approved admin emails (you can modify these)
INSERT INTO public.admin_permissions (email, is_approved, created_at) 
VALUES 
  ('admin@finsageconsult.com', true, now()),
  ('owner@finsageconsult.com', true, now());
