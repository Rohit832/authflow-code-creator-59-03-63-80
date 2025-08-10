-- Create storage bucket for session images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('session-images', 'session-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for session images
CREATE POLICY "Anyone can view session images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'session-images');

CREATE POLICY "Admins can upload session images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'session-images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can update session images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'session-images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Admins can delete session images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'session-images' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND user_type = 'admin'
  )
);