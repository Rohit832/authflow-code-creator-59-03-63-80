
-- Add IP address field to inquiries table
ALTER TABLE public.inquiries 
ADD COLUMN client_ip inet;

-- Add comment for documentation
COMMENT ON COLUMN public.inquiries.client_ip IS 'IP address of the client who submitted the inquiry';
