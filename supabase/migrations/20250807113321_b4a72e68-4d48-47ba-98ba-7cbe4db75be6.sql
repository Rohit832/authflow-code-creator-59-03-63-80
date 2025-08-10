-- Create session_links table for managing client session links
CREATE TABLE public.session_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_links ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all session links" 
ON public.session_links 
FOR ALL 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own session links" 
ON public.session_links 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_session_links_updated_at
BEFORE UPDATE ON public.session_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();