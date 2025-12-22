-- =============================================
-- FIX: INFINITE RECURSION IN ADMIN POLICIES
-- =============================================
-- Problem: Admin policies yang cek profiles table create infinite loop
-- Solution: Simplify policies to avoid recursion

-- =============================================
-- 1. Drop problematic admin policies
-- =============================================
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

-- =============================================
-- 2. Create helper function to check admin (SECURITY DEFINER)
-- =============================================
-- Function ini bypass RLS jadi tidak infinite loop
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. Recreate admin policies using helper function
-- =============================================

-- Profiles: Admins can view all (using helper function)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR is_admin()
  );

-- Orders: Admins can view all
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR is_admin()
  );

-- Orders: Admins can update all
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (is_admin());

-- Products: Admin can insert
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (is_admin());

-- Products: Admin can update
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (is_admin());

-- Products: Admin can delete
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (is_admin());

-- Categories: Admin can manage
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin());

-- =============================================
-- 4. Verify policies
-- =============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- =============================================
-- SUCCESS! Policies fixed
-- =============================================
