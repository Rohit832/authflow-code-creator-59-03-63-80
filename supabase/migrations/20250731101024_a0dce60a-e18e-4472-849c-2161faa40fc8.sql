-- Add policy to allow anonymous users to read registrations by access code for signup completion
CREATE POLICY "Anyone can read registrations by access code for signup"
ON public.client_registrations
FOR SELECT
TO anon
USING (access_code IS NOT NULL AND status = 'approved');