-- ============================================
-- Product Seed Script
-- Clear existing products and create new comprehensive sample data
-- ============================================

-- WARNING: This will delete ALL existing products!
-- Make sure to backup if needed.

BEGIN;

-- Step 1: Delete existing data (cascade will auto-delete variants, combinations, shipping)
DELETE FROM products;

-- Step 2: Insert sample products with full data
-- Note: Replace store_id and category_id with actual IDs from your database

-- Product 1: T-Shirt with Color & Size Variants
INSERT INTO products (
  store_id,
  category_id,
  title,
  slug,
  description,
  price,
  stock,
  min_purchase,
  max_purchase,
  weight_grams,
  length_cm,
  width_cm,
  height_cm,
  condition,
  brand,
  origin_country,
  warranty_type,
  warranty_period,
  image,
  images,
  is_active,
  is_featured
) VALUES (
  (SELECT id FROM stores LIMIT 1), -- Use first store
  (SELECT id FROM categories WHERE slug LIKE '%fashion%' LIMIT 1), -- Fashion category
  'Kaos Cotton Premium Unisex',
  'kaos-cotton-premium-unisex',
  'Kaos berbahan 100% cotton combed 30s yang nyaman dan adem. Cocok untuk aktivitas sehari-hari. Tersedia berbagai warna dan ukuran. Bahan lembut, tidak mudah luntur, dan tahan lama.',
  89000,
  0, -- Stock will be in combinations
  1,
  10,
  200, -- 200 grams
  30, -- 30cm length
  20, -- 20cm width
  2,  -- 2cm height (folded)
  'new',
  'Premium Cotton',
  'Indonesia',
  'Toko',
  '7 Hari',
  '/placeholder-tshirt.jpg',
  ARRAY['/placeholder-tshirt.jpg', '/placeholder-tshirt-2.jpg'],
  true,
  true
) RETURNING id AS product_1_id;

-- Get the product ID we just inserted (for variants)
-- In practice, you'd get this dynamically. For this script, we'll use a variable

DO $$
DECLARE
  p1_id UUID;
  p2_id UUID;
  p3_id UUID;
BEGIN
  -- Get first product ID
  SELECT id INTO p1_id FROM products WHERE slug = 'kaos-cotton-premium-unisex';
  
  -- Product 1: Add Variants
  -- Color variants
  INSERT INTO product_variants (product_id, variant_type, variant_value, display_order, stock, image_url) VALUES
  (p1_id, 'Warna', 'Hitam', 1, 50, NULL),
  (p1_id, 'Warna', 'Putih', 2, 45, NULL),
  (p1_id, 'Warna', 'Merah', 3, 30, NULL),
  (p1_id, 'Warna', 'Biru Navy', 4, 40, NULL);
  
  -- Size variants
  INSERT INTO product_variants (product_id, variant_type, variant_value, display_order, stock) VALUES
  (p1_id, 'Ukuran', 'S', 1, 35),
  (p1_id, 'Ukuran', 'M', 2, 50),
  (p1_id, 'Ukuran', 'L', 3, 45),
  (p1_id, 'Ukuran', 'XL', 4, 30),
  (p1_id, 'Ukuran', 'XXL', 5, 20);
  
  -- Product 1: Add Variant Combinations (Color x Size)
  INSERT INTO product_variant_combinations (product_id, combination, price, stock, sku) VALUES
  (p1_id, '[{"type": "Warna", "value": "Hitam"}, {"type": "Ukuran", "value": "M"}]'::jsonb, 89000, 15, 'TSH-BLK-M'),
  (p1_id, '[{"type": "Warna", "value": "Hitam"}, {"type": "Ukuran", "value": "L"}]'::jsonb, 89000, 12, 'TSH-BLK-L'),
  (p1_id, '[{"type": "Warna", "value": "Putih"}, {"type": "Ukuran", "value": "M"}]'::jsonb, 89000, 18, 'TSH-WHT-M'),
  (p1_id, '[{"type": "Warna", "value": "Putih"}, {"type": "Ukuran", "value": "L"}]'::jsonb, 89000, 14, 'TSH-WHT-L'),
  (p1_id, '[{"type": "Warna", "value": "Merah"}, {"type": "Ukuran", "value": "S"}]'::jsonb, 89000, 10, 'TSH-RED-S'),
  (p1_id, '[{"type": "Warna", "value": "Merah"}, {"type": "Ukuran", "value": "M"}]'::jsonb, 89000, 8, 'TSH-RED-M'),
  (p1_id, '[{"type": "Warna", "value": "Biru Navy"}, {"type": "Ukuran", "value": "L"}]'::jsonb, 89000, 12, 'TSH-NVY-L'),
  (p1_id, '[{"type": "Warna", "value": "Biru Navy"}, {"type": "Ukuran", "value": "XL"}]'::jsonb, 89000, 10, 'TSH-NVY-XL');
  
  -- Product 1: Add Shipping Options
  INSERT INTO shipping_options (product_id, courier_name, service_type, base_price, per_kg_price, estimated_days) VALUES
  (p1_id, 'JNE', 'Regular', 12000, 5000, '3-5 hari'),
  (p1_id, 'JNE', 'Express', 18000, 7000, '1-2 hari'),
  (p1_id, 'J&T Express', 'Regular', 11000, 4500, '3-4 hari'),
  (p1_id, 'SiCepat', 'Regular', 10000, 4000, '3-5 hari'),
  (p1_id, 'Grab Express', 'Same Day', 25000, NULL, '0-1 hari');
  
END $$;

-- Product 2: Backpack (single product, no variants)
INSERT INTO products (
  store_id,
  category_id,
  title,
  slug,
  description,
  price,
  stock,
  min_purchase,
  max_purchase,
  weight_grams,
  length_cm,
  width_cm,
  height_cm,
  condition,
  brand,
  origin_country,
  warranty_type,
  warranty_period,
  gtin,
  image,
  images,
  is_active
) VALUES (
  (SELECT id FROM stores LIMIT 1),
  (SELECT id FROM categories WHERE slug LIKE '%tas%' OR slug LIKE '%bag%' LIMIT 1),
  'Tas Ransel Laptop Anti Air Premium',
  'tas-ransel-laptop-anti-air',
  'Tas ransel multifungsi dengan kompartemen laptop hingga 15.6 inch. Bahan water resistant, banyak kantong, dan desain ergonomis. Cocok untuk kuliah, kerja, atau traveling.',
  299000,
  45,
  1,
  5,
  800, -- 800 grams
  45,
  30,
  15,
  'new',
  'Urban Explorer',
  'Indonesia',
  'Distributor',
  '1 Tahun',
  '8992761234567',
  '/placeholder-backpack.jpg',
  ARRAY['/placeholder-backpack.jpg', '/placeholder-backpack-2.jpg', '/placeholder-backpack-3.jpg'],
  true
);

DO $$
DECLARE
  p2_id UUID;
BEGIN
  SELECT id INTO p2_id FROM products WHERE slug = 'tas-ransel-laptop-anti-air';
  
  -- Product 2: Shipping (heavier item)
  INSERT INTO shipping_options (product_id, courier_name, service_type, base_price, per_kg_price, estimated_days) VALUES
  (p2_id, 'JNE', 'Regular', 15000, 6000, '3-5 hari'),
  (p2_id, 'J&T Express', 'Regular', 14000, 5500, '3-4 hari'),
  (p2_id, 'SiCepat', 'Express', 20000, 8000, '2-3 hari'),
  (p2_id, 'Ninja Xpress', 'Regular', 13000, 5000, '4-6 hari');
END $$;

-- Product 3: Book (simple product)
INSERT INTO products (
  store_id,
  category_id,
  title,
  slug,
  description,
  price,
  stock,
  min_purchase,
  max_purchase,
  weight_grams,
  length_cm,
  width_cm,
  height_cm,
  condition,
  brand,
  origin_country,
  image,
  images,
  is_active,
  is_bestseller
) VALUES (
  (SELECT id FROM stores LIMIT 1),
  (SELECT id FROM categories WHERE slug LIKE '%buku%' LIMIT 1),
  'Buku Self Development: Atomic Habits',
  'buku-atomic-habits',
  'Buku bestseller yang mengajarkan cara membangun kebiasaan baik dan menghilangkan kebiasaan buruk. Terjemahan Bahasa Indonesia, cover original, kertas premium.',
  98000,
  120,
  1,
  20,
  350, -- 350 grams
  21,
  14,
  2,
  'new',
  'Gramedia Pustaka',
  'Indonesia',
  '/placeholder-book.jpg',
  ARRAY['/placeholder-book.jpg'],
  true,
  true
);

DO $$
DECLARE
  p3_id UUID;
BEGIN
  SELECT id INTO p3_id FROM products WHERE slug = 'buku-atomic-habits';
  
  -- Product 3: Shipping (light item)
  INSERT INTO shipping_options (product_id, courier_name, service_type, base_price, estimated_days) VALUES
  (p3_id, 'JNE', 'Regular', 10000, '3-5 hari'),
  (p3_id, 'J&T Express', 'Regular', 9000, '3-4 hari'),
  (p3_id, 'SiCepat', 'Regular', 8500, '3-5 hari');
END $$;

-- Product 4: Sepatu with Size Variants
INSERT INTO products (
  store_id,
  category_id,
  title,
  slug,
  description,
  price,
  stock,
  min_purchase,
  weight_grams,
  length_cm,
  width_cm,
  height_cm,
  condition,
  brand,
  origin_country,
  warranty_type,
  warranty_period,
  image,
  images,
  is_active,
  is_featured
) VALUES (
  (SELECT id FROM stores LIMIT 1),
  (SELECT id FROM categories WHERE slug LIKE '%sepatu%' OR slug LIKE '%shoes%' LIMIT 1),
  'Sepatu Sneakers Casual Running Sport',
  'sepatu-sneakers-casual-running',
  'Sepatu sneakers multifungsi untuk olahraga dan casual. Sol empuk dan anti slip. Material breathable mesh yang nyaman dipakai seharian.',
  249000,
  0, -- Stock in variants
  1,
  600, -- 600 grams per pair
  33,
  20,
  12,
  'new',
  'SportMax',
  'Vietnam',
  'Distributor',
  '60 Hari',
  '/placeholder-shoes.jpg',
  ARRAY['/placeholder-shoes.jpg', '/placeholder-shoes-2.jpg'],
  true,
  true
);

DO $$
DECLARE
  p4_id UUID;
BEGIN
  SELECT id INTO p4_id FROM products WHERE slug = 'sepatu-sneakers-casual-running';
  
  -- Product 4: Size Variants (shoe sizes)
  INSERT INTO product_variants (product_id, variant_type, variant_value, display_order, price_adjustment, stock) VALUES
  (p4_id, 'Ukuran', '38', 1, 0, 8),
  (p4_id, 'Ukuran', '39', 2, 0, 12),
  (p4_id, 'Ukuran', '40', 3, 0, 15),
  (p4_id, 'Ukuran', '41', 4, 0, 18),
  (p4_id, 'Ukuran', '42', 5, 0, 14),
  (p4_id, 'Ukuran', '43', 6, 0, 10),
  (p4_id, 'Ukuran', '44', 7, 0, 6);
  
  -- Product 4: Shipping
  INSERT INTO shipping_options (product_id, courier_name, service_type, base_price, per_kg_price, estimated_days) VALUES
  (p4_id, 'JNE', 'Regular', 14000, 5500, '3-5 hari'),
  (p4_id, 'J&T Express', 'Express', 20000, 7500, '2-3 hari'),
  (p4_id, 'SiCepat', 'Regular', 13000, 5000, '3-4 hari');
END $$;

COMMIT;

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE '✅ Seed data created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Created products:';
  RAISE NOTICE '  1. Kaos Cotton (with Color x Size variants)';
  RAISE NOTICE '  2. Tas Ransel Laptop (no variants)';
  RAISE NOTICE '  3. Buku Atomic Habits (no variants)';
  RAISE NOTICE '  4. Sepatu Sneakers (with Size variants)';
  RAISE NOTICE '';
  RAISE NOTICE 'Each product includes:';
  RAISE NOTICE '  - Complete product info (weight, dimensions, brand, warranty)';
  RAISE NOTICE '  - Shipping options (multiple couriers)';
  RAISE NOTICE '  - Variants where applicable';
END $$;
