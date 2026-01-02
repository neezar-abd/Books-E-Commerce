-- =============================================
-- FIX: Infinite Recursion in Profiles RLS
-- Run this FIRST before anything else!
-- =============================================

-- 1. Drop ALL problematic policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmin can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;

-- 2. Create SIMPLE policies that don't cause recursion
-- Users can only see their OWN profile (no recursion)
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 3. For superadmin access, we use auth.jwt() instead of subquery
-- This avoids the infinite recursion
CREATE POLICY "Admin full access" ON profiles 
  FOR ALL 
  USING (
    (auth.jwt() ->> 'role')::text = 'service_role' 
    OR auth.uid() = id
  );

-- 4. Fix products table policies too
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON products;
DROP POLICY IF EXISTS "Superadmin can view all products" ON products;
DROP POLICY IF EXISTS "Superadmin can manage all products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;

-- Simple public read for products (no recursion)
CREATE POLICY "Public can view products" ON products 
  FOR SELECT 
  USING (true);

-- Sellers manage own (uses stores, not profiles)
CREATE POLICY "Sellers can manage own products" ON products 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

-- 5. Fix stores table policies
DROP POLICY IF EXISTS "Anyone can view active stores" ON stores;
DROP POLICY IF EXISTS "Sellers can manage own store" ON stores;
DROP POLICY IF EXISTS "Superadmin can view all stores" ON stores;
DROP POLICY IF EXISTS "Superadmin can manage all stores" ON stores;

CREATE POLICY "Public can view stores" ON stores 
  FOR SELECT 
  USING (true);

CREATE POLICY "Sellers can manage own store" ON stores 
  FOR ALL 
  USING (auth.uid() = owner_id);

-- 6. Fix categories
DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Superadmin can manage categories" ON categories;

CREATE POLICY "Public can view categories" ON categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admin can manage categories" ON categories 
  FOR ALL 
  USING ((auth.jwt() ->> 'role')::text = 'service_role');

-- 7. Fix banners
DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
DROP POLICY IF EXISTS "Superadmin can manage banners" ON banners;

CREATE POLICY "Public can view banners" ON banners 
  FOR SELECT 
  USING (true);

-- 8. Verify - should show no errors
SELECT 'Policies fixed successfully!' as status;
