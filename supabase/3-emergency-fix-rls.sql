-- =============================================
-- EMERGENCY FIX: Profiles RLS
-- This completely resets and fixes profiles access
-- =============================================

-- STEP 1: Completely disable RLS on profiles temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Delete ALL policies (aggressive cleanup)
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
    END LOOP;
END $$;

-- STEP 3: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create NEW simple policies
-- Allow ALL authenticated users to SELECT any profile (for role checks)
CREATE POLICY "Authenticated users can read profiles" ON profiles 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Allow users to UPDATE only their own profile
CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to INSERT only their own profile
CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- STEP 5: Check if profile exists for the user
SELECT id, email, name, role FROM profiles WHERE email = 'bowwater2@gmail.com';
SELECT id, email, name, role FROM profiles WHERE email = 'nizarabdurr@gmail.com';

-- STEP 6: If profile doesn't exist, we need to wait for user to login first
-- After user logs in, run this to set superadmin:
UPDATE profiles SET role = 'superadmin' WHERE email = 'bowwater2@gmail.com';
UPDATE profiles SET role = 'superadmin' WHERE email = 'nizarabdurr@gmail.com';

-- STEP 7: Verify policies created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';

-- STEP 8: Test read access (should return all profiles now)
SELECT id, email, role FROM profiles LIMIT 5;
