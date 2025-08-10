-- Allow anyone to insert into individuals table during registration
CREATE POLICY "Allow individual user registration" 
ON public.individuals 
FOR INSERT 
WITH CHECK (true);

-- Update the existing policy to be more specific about viewing own data
DROP POLICY IF EXISTS "Individuals can view their own data" ON public.individuals;

CREATE POLICY "Individuals can view their own data" 
ON public.individuals 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Individuals can update their own data" 
ON public.individuals 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Individuals can delete their own data" 
ON public.individuals 
FOR DELETE 
USING (id = auth.uid());