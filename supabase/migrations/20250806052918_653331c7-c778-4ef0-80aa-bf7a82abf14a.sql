-- Add approval status to admin_profiles table
ALTER TABLE public.admin_profiles 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.admin_profiles 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.admin_profiles(user_id);

ALTER TABLE public.admin_profiles 
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone;

ALTER TABLE public.admin_profiles 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update RLS policies for admin_profiles to handle pending approvals
DROP POLICY IF EXISTS "Allow admin profile creation" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.admin_profiles;
DROP POLICY IF EXISTS "Admins can update their own profile" ON public.admin_profiles;

-- Allow anyone to create pending admin profiles
CREATE POLICY "Allow pending admin signup" ON public.admin_profiles
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid() AND approval_status = 'pending');

-- Users can view their own profile regardless of approval status
CREATE POLICY "Users can view own profile" ON public.admin_profiles
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Only approved admins can view all profiles
CREATE POLICY "Approved admins can view all profiles" ON public.admin_profiles
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid() 
    AND approval_status = 'approved' 
    AND is_super_admin = true
  )
);

-- Only super admins can update approval status
CREATE POLICY "Super admins can approve profiles" ON public.admin_profiles
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_profiles 
    WHERE user_id = auth.uid() 
    AND approval_status = 'approved' 
    AND is_super_admin = true
  )
);

-- Users can update their own profile data (but not approval status)
CREATE POLICY "Users can update own profile data" ON public.admin_profiles
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (
  user_id = auth.uid() 
  AND approval_status = OLD.approval_status 
  AND approved_by = OLD.approved_by 
  AND approved_at = OLD.approved_at
);