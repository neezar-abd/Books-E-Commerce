-- =============================================
-- SUPERADMIN SETUP
-- Run this after main schema is created
-- =============================================

-- 1. Update role check to include 'superadmin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'seller', 'admin', 'superadmin'));

-- 2. Create superadmin user (replace with your email)
-- Option A: Update existing user to superadmin
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'nizarabdurr@gmail.com';

-- Option B: If profile doesn't exist yet, insert after first login
-- INSERT INTO profiles (id, email, role) 
-- VALUES (
--   (SELECT id FROM auth.users WHERE email = 'your-email@gmail.com'),
--   'your-email@gmail.com',
--   'superadmin'
-- ) ON CONFLICT (id) DO UPDATE SET role = 'superadmin';

-- 3. Grant superadmin full access to admin panel
-- Superadmin can view and manage everything
CREATE POLICY "Superadmin can view all profiles" ON profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin can manage all profiles" ON profiles 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 4. Grant superadmin access to all stores
CREATE POLICY "Superadmin can view all stores" ON stores 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin can manage all stores" ON stores 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 5. Grant superadmin access to all products
CREATE POLICY "Superadmin can view all products" ON products 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin can manage all products" ON products 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 6. Grant superadmin access to all orders
CREATE POLICY "Superadmin can view all orders" ON orders 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmin can manage all orders" ON orders 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 7. Grant superadmin access to order_items
CREATE POLICY "Superadmin can view all order items" ON order_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 8. Grant superadmin access to categories
CREATE POLICY "Superadmin can manage all categories" ON categories 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 9. Grant superadmin access to banners
CREATE POLICY "Superadmin can manage all banners" ON banners 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- =============================================
-- VERIFICATION
-- =============================================
-- Check if superadmin was created successfully:
SELECT id, email, role, created_at 
FROM profiles 
WHERE role = 'superadmin';
