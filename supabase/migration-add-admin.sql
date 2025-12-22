-- =============================================
-- MIGRATION: ADD ADMIN FEATURES
-- =============================================
-- Script ini untuk menambahkan fitur admin ke database existing
-- Aman dijalankan tanpa menghapus data

-- =============================================
-- 1. Add role column to profiles (if not exists)
-- =============================================
DO $$ 
BEGIN
  -- Check if role column exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    -- Add role column
    ALTER TABLE profiles 
    ADD COLUMN role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    
    RAISE NOTICE 'Added role column to profiles table';
  ELSE
    RAISE NOTICE 'Role column already exists in profiles table';
  END IF;
END $$;

-- =============================================
-- 2. Drop existing admin policies if they exist
-- =============================================
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- =============================================
-- 3. Create admin policies
-- =============================================

-- Products: Admin can insert
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: Admin can update
CREATE POLICY "Admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: Admin can delete
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories: Admin can manage
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: Admin can view all
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: Admin can update all
CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Profiles: Admin can view all
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 4. Verify migration
-- =============================================

-- Check role column
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'role';

-- Check policies
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE policyname LIKE '%Admin%'
ORDER BY tablename, policyname;

-- =============================================
-- DONE! Migration completed successfully
-- =============================================
-- Next step: Create admin user dengan script create-admin.sql
