-- Add RLS policy to allow admins to delete sessions
CREATE POLICY "Admins can delete sessions" 
ON public.sessions 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Also add policies for INSERT and UPDATE for admins
CREATE POLICY "Admins can insert sessions" 
ON public.sessions 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update sessions" 
ON public.sessions 
FOR UPDATE 
USING (is_admin(auth.uid()));