-- =============================================
-- VERIFY USER ROLE
-- Run this to check if the user is truly superadmin
-- =============================================

SELECT id, email, role, created_at 
FROM profiles 
WHERE email IN ('bowwater2@gmail.com', 'nizarabdurr@gmail.com');
