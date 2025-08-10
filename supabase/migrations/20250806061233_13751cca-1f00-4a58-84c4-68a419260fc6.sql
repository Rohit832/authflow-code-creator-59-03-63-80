-- Add admin permission for rohitsaw835@gmail.com
INSERT INTO public.admin_permissions (email, is_approved)
VALUES ('rohitsaw835@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET is_approved = true;