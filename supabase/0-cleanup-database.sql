-- =============================================
-- ZAREE DATABASE CLEANUP SCRIPT
-- ⚠️ WARNING: This will DELETE ALL DATA!
-- Use this only to start fresh from scratch
-- =============================================

-- Drop all policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Superadmin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Superadmin can manage all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view categories" ON categories;
DROP POLICY IF EXISTS "Superadmin can manage categories" ON categories;

DROP POLICY IF EXISTS "Anyone can view active stores" ON stores;
DROP POLICY IF EXISTS "Sellers can manage own store" ON stores;
DROP POLICY IF EXISTS "Superadmin can view all stores" ON stores;
DROP POLICY IF EXISTS "Superadmin can manage all stores" ON stores;

DROP POLICY IF EXISTS "Anyone can view active products" ON products;
DROP POLICY IF EXISTS "Sellers can manage own products" ON products;
DROP POLICY IF EXISTS "Superadmin can view all products" ON products;
DROP POLICY IF EXISTS "Superadmin can manage all products" ON products;

DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
DROP POLICY IF EXISTS "Superadmin can manage banners" ON banners;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Superadmin can view all orders" ON orders;
DROP POLICY IF EXISTS "Superadmin can manage all orders" ON orders;

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Superadmin can view all order items" ON order_items;

DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;

DROP POLICY IF EXISTS "Anyone can view reviews" ON product_reviews;
DROP POLICY IF EXISTS "Users can manage own reviews" ON product_reviews;

DROP POLICY IF EXISTS "Anyone can view provinces" ON provinces;
DROP POLICY IF EXISTS "Anyone can view cities" ON cities;

-- Drop storage policies
DROP POLICY IF EXISTS "auth_upload_products" ON storage.objects;
DROP POLICY IF EXISTS "public_read_products" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_stores" ON storage.objects;
DROP POLICY IF EXISTS "public_read_stores" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_content" ON storage.objects;
DROP POLICY IF EXISTS "public_read_content" ON storage.objects;

-- Drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_store_product_count_trigger ON products;
DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_store_product_count() CASCADE;
DROP FUNCTION IF EXISTS update_product_rating() CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS stores CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS provinces CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop storage buckets (optional - comment out if you want to keep files)
-- DELETE FROM storage.buckets WHERE id IN ('products', 'stores', 'content');

-- =============================================
-- CLEANUP COMPLETE! ✅
-- Now you can run the setup scripts in order
-- =============================================
