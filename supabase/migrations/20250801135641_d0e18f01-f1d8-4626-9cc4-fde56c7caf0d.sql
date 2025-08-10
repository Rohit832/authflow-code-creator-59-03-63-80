-- Add foreign key constraint to link credit_requests to profiles
ALTER TABLE public.credit_requests 
ADD CONSTRAINT credit_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id);