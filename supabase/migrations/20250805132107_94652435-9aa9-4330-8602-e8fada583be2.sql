-- Create storage buckets for chat attachments
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('chat-images', 'chat-images', true),
  ('chat-audio', 'chat-audio', true);

-- Create storage policies for chat images
CREATE POLICY "Anyone can view chat images"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own chat images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for chat audio
CREATE POLICY "Anyone can view chat audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-audio');

CREATE POLICY "Authenticated users can upload chat audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own chat audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'chat-audio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add attachment columns to messages table
ALTER TABLE messages 
ADD COLUMN attachment_url text,
ADD COLUMN attachment_type text CHECK (attachment_type IN ('image', 'audio', 'file')),
ADD COLUMN attachment_name text,
ADD COLUMN attachment_size bigint;

-- Update message_type enum to include new types
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_message_type_check;

ALTER TABLE messages 
ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN ('text', 'image', 'audio', 'file'));

-- Add attachment columns to pending_messages table
ALTER TABLE pending_messages 
ADD COLUMN attachment_url text,
ADD COLUMN attachment_type text CHECK (attachment_type IN ('image', 'audio', 'file')),
ADD COLUMN attachment_name text,
ADD COLUMN attachment_size bigint;

-- Update pending_messages message_type constraint
ALTER TABLE pending_messages 
DROP CONSTRAINT IF EXISTS pending_messages_message_type_check;

ALTER TABLE pending_messages 
ADD CONSTRAINT pending_messages_message_type_check 
CHECK (message_type IN ('text', 'image', 'audio', 'file'));