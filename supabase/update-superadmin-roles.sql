-- =============================================
-- SET SUPERADMIN ROLES
-- Run this to set both users as superadmin
-- =============================================

-- Update both users to superadmin
UPDATE profiles 
SET role = 'superadmin' 
WHERE email IN ('bowwater2@gmail.com', 'nizarabdurr@gmail.com');

-- Verify the updates
SELECT id, email, role, created_at 
FROM profiles 
WHERE email IN ('bowwater2@gmail.com', 'nizarabdurr@gmail.com');

-- If no rows returned, it means user hasn't logged in yet
-- User needs to login first to create profile, then run this script again
