-- =============================================
-- QUICK FIX: Products RLS Policy
-- Run this if products not loading
-- =============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON products;
DROP POLICY IF EXISTS "Superadmin can view all products" ON products;
DROP POLICY IF EXISTS "Superadmin can manage all products" ON products;
DROP POLICY IF EXISTS "Public can view products" ON products;

-- Create simple public read policy
CREATE POLICY "Public can view products" ON products 
  FOR SELECT 
  USING (true);

-- Sellers manage own products
CREATE POLICY "Sellers can manage own products" ON products 
  FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

-- Verify
SELECT tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';
