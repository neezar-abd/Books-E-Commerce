-- =============================================
-- CREATE FIRST ADMIN USER
-- =============================================
-- Script ini untuk membuat admin user pertama kali
-- Jalankan setelah setup Supabase selesai

-- =============================================
-- STEP 1: Lihat semua users yang ada
-- =============================================
-- Jalankan query ini terlebih dahulu untuk melihat semua users
-- Copy ID user yang ingin dijadikan admin

SELECT 
  p.id,
  au.email,
  p.full_name,
  p.phone,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
ORDER BY p.created_at DESC;

-- =============================================
-- STEP 2: Set user menjadi admin
-- =============================================
-- INSTRUKSI:
-- 1. Dari hasil query di atas, copy ID user yang ingin dijadikan admin
-- 2. Ganti 'PASTE-USER-ID-HERE' di bawah dengan ID tersebut
-- 3. Uncomment (hapus --) baris UPDATE di bawah
-- 4. Jalankan query UPDATE

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = 'PASTE-USER-ID-HERE';

-- =============================================
-- STEP 3: Verify admin berhasil dibuat
-- =============================================
-- Jalankan query ini untuk memastikan admin sudah dibuat

SELECT 
  p.id,
  au.email,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.role = 'admin';

-- =============================================
-- ALTERNATIF: Set admin by email
-- =============================================
-- Jika kamu tahu email user, bisa langsung promote by email
-- Uncomment dan ganti 'user@example.com' dengan email yang sebenarnya

-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'user@example.com'
-- );

-- =============================================
-- Useful Admin Queries
-- =============================================

-- 1. List all admin users
SELECT 
  p.id,
  au.email,
  p.full_name,
  p.role
FROM profiles p
JOIN auth.users au ON au.id = p.id
WHERE p.role = 'admin';

-- 2. Count users by role
SELECT 
  role,
  COUNT(*) as total
FROM profiles
GROUP BY role;

-- 3. Promote user to admin by email (SAFE - uncomment untuk pakai)
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'GANTI-DENGAN-EMAIL'
-- );

-- 4. Demote admin to user (SAFE - uncomment untuk pakai)
-- UPDATE profiles 
-- SET role = 'user' 
-- WHERE id = 'GANTI-DENGAN-USER-ID';

-- 5. Get admin dashboard stats (quick check)
SELECT 
  (SELECT COUNT(*) FROM orders) as total_orders,
  (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM products WHERE stock < 10) as low_stock_products;
