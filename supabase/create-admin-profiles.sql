-- =============================================
-- CREATE PROFILE FOR AUTHENTICATED USERS
-- This creates profile entries for users who don't have one yet
-- =============================================

-- First, let's see all auth users vs profiles
SELECT 
    au.id,
    au.email,
    au.created_at as auth_created_at,
    p.role as profile_role
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email IN ('bowwater2@gmail.com', 'nizarabdurr@gmail.com')
ORDER BY au.created_at DESC;

-- If a user exists in auth but not in profiles, insert them
-- For bowwater2@gmail.com
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    'superadmin' as role,
    created_at,
    now() as updated_at
FROM auth.users
WHERE email = 'bowwater2@gmail.com'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);

-- For nizarabdurr@gmail.com
INSERT INTO profiles (id, email, role, created_at, updated_at)
SELECT 
    id, 
    email, 
    'superadmin' as role,
    created_at,
    now() as updated_at
FROM auth.users
WHERE email = 'nizarabdurr@gmail.com'
AND NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);

-- Update existing profiles to superadmin (if they already exist)
UPDATE profiles 
SET role = 'superadmin', updated_at = now()
WHERE email IN ('bowwater2@gmail.com', 'nizarabdurr@gmail.com');

-- Verify the results
SELECT id, email, role, created_at 
FROM profiles 
WHERE email IN ('bowwater2@gmail.com', 'nizarabdurr@gmail.com');
