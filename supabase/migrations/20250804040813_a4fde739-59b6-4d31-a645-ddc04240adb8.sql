-- Fix user types for users who have admin permissions
UPDATE profiles 
SET user_type = 'admin'
WHERE user_id IN (
  SELECT p.user_id 
  FROM profiles p
  JOIN auth.users au ON p.user_id = au.id
  JOIN admin_permissions ap ON au.email = ap.email
  WHERE ap.is_approved = true AND p.user_type = 'client'
);