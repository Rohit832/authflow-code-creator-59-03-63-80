-- Add policy to allow checking admin permissions during sign-in
CREATE POLICY "Anyone can check admin permissions for sign-in" 
ON public.admin_permissions 
FOR SELECT 
USING (true);