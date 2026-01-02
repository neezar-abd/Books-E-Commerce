-- =============================================
-- FIX PROFILES RLS - SIMPLE VERSION
-- Run this to fix admin access
-- =============================================

-- 1. Disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admin full access" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- 3. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create SIMPLE policies (no recursion)
-- Allow authenticated users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 5. Verify user exists and check role
SELECT id, email, role FROM profiles WHERE email = 'bowwater2@gmail.com';

-- 6. If row exists but role is wrong, update it:
UPDATE profiles SET role = 'superadmin' WHERE email = 'bowwater2@gmail.com';

-- 7. Verify again
SELECT id, email, role FROM profiles WHERE email = 'bowwater2@gmail.com';

-- 8. Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
