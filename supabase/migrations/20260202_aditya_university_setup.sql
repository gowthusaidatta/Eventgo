-- Add Aditya University college role and subdomain support to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS college_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_aditya_subdomain BOOLEAN DEFAULT FALSE;

-- Create comment for clarity
COMMENT ON COLUMN profiles.college_role IS 'College staff role: principal, dean, coordinator, teaching_staff, staff_coordinator';
COMMENT ON COLUMN profiles.is_aditya_subdomain IS 'Flag to identify if user is from Aditya University subdomain';

-- Add index for performance on Aditya subdomain lookups
CREATE INDEX IF NOT EXISTS idx_profiles_aditya_subdomain ON profiles(is_aditya_subdomain);
CREATE INDEX IF NOT EXISTS idx_profiles_college_role ON profiles(college_role);

-- Create an index for filtering college users by role
CREATE INDEX IF NOT EXISTS idx_profiles_role_college_role ON profiles(user_id, college_role);
