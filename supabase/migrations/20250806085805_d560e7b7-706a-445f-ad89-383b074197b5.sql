-- Add admin permission for babu1@gmail.com
INSERT INTO public.admin_permissions (email, is_approved)
VALUES ('babu1@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_approved = true;