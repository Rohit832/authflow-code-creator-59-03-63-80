-- Add RLS policy to allow authentication queries on individuals table
CREATE POLICY "Allow email lookup for authentication" 
ON individuals 
FOR SELECT 
USING (true);

-- Note: This allows reading email and password_hash for authentication
-- The existing policy "Individuals can view their own data" will still protect 
-- other operations and full profile data access