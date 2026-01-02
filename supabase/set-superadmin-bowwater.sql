-- =============================================
-- SET SUPERADMIN: bowwater2@gmail.com
-- Run this in Supabase SQL Editor
-- =============================================

-- Update user to superadmin role
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'bowwater2@gmail.com';

-- Verify the update
SELECT id, email, name, role, created_at 
FROM profiles 
WHERE email = 'bowwater2@gmail.com';

-- If profile doesn't exist yet (user hasn't logged in):
-- First login with Google OAuth, then run this script again
