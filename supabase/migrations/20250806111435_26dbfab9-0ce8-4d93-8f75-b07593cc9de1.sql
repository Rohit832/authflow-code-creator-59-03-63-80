-- Add policy to allow authenticated users to read their own registration data
CREATE POLICY "Users can read their own registration data" 
ON public.client_registrations 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND email = (auth.jwt() ->> 'email'));