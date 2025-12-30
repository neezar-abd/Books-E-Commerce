-- =============================================
-- ZAREE MARKETPLACE - SEED DATA
-- Sample categories, products, and content
-- =============================================

-- =============================================
-- 1. CATEGORIES (General E-Commerce)
-- =============================================
INSERT INTO categories (id, name, slug, description, icon, position, is_active) VALUES
  ('11111111-1111-1111-1111-111111111101', 'Elektronik', 'elektronik', 'Gadget, komputer, dan perangkat elektronik', 'Smartphone', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'Fashion Pria', 'fashion-pria', 'Pakaian, sepatu, dan aksesoris pria', 'Shirt', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'Fashion Wanita', 'fashion-wanita', 'Pakaian, sepatu, dan aksesoris wanita', 'ShoppingBag', 3, true),
  ('11111111-1111-1111-1111-111111111104', 'Kesehatan & Kecantikan', 'kesehatan-kecantikan', 'Skincare, makeup, dan produk kesehatan', 'Heart', 4, true),
  ('11111111-1111-1111-1111-111111111105', 'Rumah Tangga', 'rumah-tangga', 'Peralatan rumah dan dekorasi', 'Home', 5, true),
  ('11111111-1111-1111-1111-111111111106', 'Makanan & Minuman', 'makanan-minuman', 'Makanan, snack, dan minuman', 'Coffee', 6, true),
  ('11111111-1111-1111-1111-111111111107', 'Olahraga & Outdoor', 'olahraga-outdoor', 'Peralatan olahraga dan aktivitas outdoor', 'Dumbbell', 7, true),
  ('11111111-1111-1111-1111-111111111108', 'Hobi & Koleksi', 'hobi-koleksi', 'Mainan, koleksi, dan hobi', 'Gamepad2', 8, true),
  ('11111111-1111-1111-1111-111111111109', 'Otomotif', 'otomotif', 'Aksesoris dan sparepart kendaraan', 'Car', 9, true),
  ('11111111-1111-1111-1111-111111111110', 'Buku & Alat Tulis', 'buku-alat-tulis', 'Buku, alat tulis, dan perlengkapan kantor', 'BookOpen', 10, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. SAMPLE STORES
-- =============================================
INSERT INTO stores (id, name, slug, description, city, province, rating, review_count, total_products, total_sales, is_verified, is_active) VALUES
  ('22222222-2222-2222-2222-222222222201', 'Zaree Official Store', 'zaree-official', 'Toko resmi Zaree Marketplace dengan produk berkualitas', 'Jakarta Selatan', 'DKI Jakarta', 4.9, 1250, 50, 5000, true, true),
  ('22222222-2222-2222-2222-222222222202', 'Tech Galaxy', 'tech-galaxy', 'Gadget dan elektronik terlengkap dengan harga terbaik', 'Bandung', 'Jawa Barat', 4.8, 890, 35, 3200, true, true),
  ('22222222-2222-2222-2222-222222222203', 'Fashion Hub ID', 'fashion-hub-id', 'Pusat fashion trendy untuk pria dan wanita', 'Surabaya', 'Jawa Timur', 4.7, 650, 80, 2800, true, true),
  ('22222222-2222-2222-2222-222222222204', 'Home Living Store', 'home-living', 'Dekorasi dan peralatan rumah tangga modern', 'Yogyakarta', 'DI Yogyakarta', 4.6, 420, 45, 1500, true, true),
  ('22222222-2222-2222-2222-222222222205', 'Healthy Choice', 'healthy-choice', 'Produk kesehatan, suplemen, dan skincare original', 'Medan', 'Sumatera Utara', 4.8, 380, 60, 2100, true, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. SAMPLE PRODUCTS (20+ Products)
-- =============================================
INSERT INTO products (id, store_id, category_id, title, description, sku, brand, weight, price, original_price, discount, stock, image, rating, total_sold, is_active, is_featured, is_bestseller, condition) VALUES
  -- Elektronik
  ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101', 
   'Smartphone Pro Max 256GB', 'Smartphone flagship dengan kamera 108MP, layar AMOLED 6.7", dan baterai 5000mAh. Performa super cepat dengan prosesor terbaru.',
   'TECH-SP001', 'TechBrand', 250, 12999000, 14999000, 13, 50, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', 4.8, 1250, true, true, true, 'new'),
  
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101',
   'Wireless Earbuds Premium', 'Earbuds dengan Active Noise Cancellation, battery life 30 jam, dan suara jernih berkualitas Hi-Fi.',
   'TECH-WE002', 'AudioMax', 80, 899000, 1299000, 31, 120, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500', 4.7, 890, true, true, false, 'new'),
  
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111101',
   'Laptop Gaming RTX 4060', 'Laptop gaming dengan RTX 4060, Intel i7 Gen 13, RAM 16GB, SSD 512GB. Layar 144Hz.',
   'TECH-LG003', 'GameForce', 2500, 18500000, 21000000, 12, 25, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500', 4.9, 320, true, true, true, 'new'),

  -- Fashion Pria
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102',
   'Kemeja Slim Fit Premium', 'Kemeja pria slim fit bahan katun premium, nyaman dipakai seharian. Tersedia berbagai ukuran.',
   'FASH-KS004', 'UrbanStyle', 300, 289000, 399000, 28, 200, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500', 4.6, 750, true, false, true, 'new'),
  
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111102',
   'Sepatu Sneakers Casual', 'Sepatu sneakers dengan desain modern, sole empuk, dan bahan breathable. Cocok untuk daily wear.',
   'FASH-SS005', 'StepUp', 800, 459000, 599000, 23, 150, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 4.7, 680, true, true, false, 'new'),

  -- Fashion Wanita  
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103',
   'Dress Elegant Floral', 'Dress cantik dengan motif floral, bahan chiffon premium. Cocok untuk acara formal dan casual.',
   'FASH-DE006', 'Elegance', 250, 359000, 499000, 28, 80, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500', 4.8, 520, true, true, false, 'new'),
  
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111103',
   'Tas Selempang Wanita', 'Tas selempang dengan desain minimalis, bahan kulit sintetis premium, banyak kompartemen.',
   'FASH-TS007', 'BagLady', 400, 275000, 350000, 21, 100, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500', 4.5, 890, true, false, true, 'new'),

  -- Kesehatan & Kecantikan
  ('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111104',
   'Serum Vitamin C 20%', 'Serum wajah dengan Vitamin C konsentrasi tinggi untuk mencerahkan dan anti-aging. Dermatologically tested.',
   'HLTH-SV008', 'GlowSkin', 50, 189000, 250000, 24, 300, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500', 4.9, 1500, true, true, true, 'new'),
  
  ('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222205', '11111111-1111-1111-1111-111111111104',
   'Suplemen Multivitamin', 'Multivitamin lengkap untuk menjaga daya tahan tubuh. Isi 60 kapsul untuk 2 bulan.',
   'HLTH-SM009', 'VitaPlus', 150, 145000, 199000, 27, 500, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500', 4.6, 2100, true, false, true, 'new'),

  -- Rumah Tangga
  ('33333333-3333-3333-3333-333333333310', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111105',
   'Set Panci Anti Lengket 5pcs', 'Set panci dan wajan anti lengket berkualitas. Aman untuk semua jenis kompor.',
   'HOME-SP010', 'KitchenPro', 3000, 599000, 799000, 25, 80, 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=500', 4.7, 450, true, true, false, 'new'),
  
  ('33333333-3333-3333-3333-333333333311', '22222222-2222-2222-2222-222222222204', '11111111-1111-1111-1111-111111111105',
   'Lampu LED Smart WiFi', 'Lampu pintar yang bisa dikontrol via smartphone. Bisa ganti warna dan atur jadwal.',
   'HOME-LS011', 'SmartHome', 200, 125000, 175000, 29, 200, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 4.5, 780, true, false, true, 'new'),

  -- Makanan & Minuman
  ('33333333-3333-3333-3333-333333333312', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111106',
   'Kopi Arabica Premium 500g', 'Biji kopi arabica pilihan dari dataran tinggi, roasting medium untuk rasa seimbang.',
   'FOOD-KA012', 'KopiNusantara', 550, 125000, 150000, 17, 150, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 4.8, 920, true, true, false, 'new'),
  
  ('33333333-3333-3333-3333-333333333313', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111106',
   'Snack Box Hampers', 'Paket snack premium berisi 12 jenis makanan ringan. Cocok untuk hadiah atau acara.',
   'FOOD-SH013', 'SnackHouse', 1500, 275000, 350000, 21, 100, 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500', 4.6, 340, true, false, false, 'new'),

  -- Olahraga & Outdoor
  ('33333333-3333-3333-3333-333333333314', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111107',
   'Dumbbell Set 20kg', 'Set dumbbell adjustable 20kg dengan case. Cocok untuk home workout.',
   'SPRT-DS014', 'FitGear', 22000, 899000, 1200000, 25, 60, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500', 4.7, 280, true, false, true, 'new'),
  
  ('33333333-3333-3333-3333-333333333315', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111107',
   'Matras Yoga Premium', 'Matras yoga tebal 6mm, anti slip, dengan tas carrier. Nyaman untuk berbagai pose.',
   'SPRT-MY015', 'YogaLife', 1500, 245000, 299000, 18, 120, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 4.8, 560, true, true, false, 'new'),

  -- Hobi & Koleksi
  ('33333333-3333-3333-3333-333333333316', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111108',
   'Action Figure Limited Edition', 'Action figure koleksi limited edition dengan detail tinggi dan articulation lengkap.',
   'HOBB-AF016', 'CollectX', 400, 459000, 599000, 23, 30, 'https://images.unsplash.com/photo-1608889825103-eb5ed706fc64?w=500', 4.9, 150, true, true, false, 'new'),
  
  ('33333333-3333-3333-3333-333333333317', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111108',
   'Puzzle 1000pcs Premium', 'Puzzle berkualitas tinggi dengan gambar indah, isi 1000 pieces. Cocok untuk dewasa.',
   'HOBB-PZ017', 'PuzzleWorld', 800, 175000, 225000, 22, 80, 'https://images.unsplash.com/photo-1606503153255-59d7b5d5a6dd?w=500', 4.5, 340, true, false, false, 'new'),

  -- Otomotif
  ('33333333-3333-3333-3333-333333333318', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111109',
   'Dashcam Full HD 1080p', 'Kamera dashboard dengan rekaman Full HD, G-sensor, dan night vision.',
   'AUTO-DC018', 'CarGuard', 350, 425000, 550000, 23, 70, 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=500', 4.6, 420, true, true, false, 'new'),
  
  ('33333333-3333-3333-3333-333333333319', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111109',
   'Vacuum Cleaner Mobil', 'Vacuum cleaner portable untuk mobil, daya hisap kuat, dengan berbagai nozzle.',
   'AUTO-VC019', 'CleanDrive', 600, 185000, 250000, 26, 100, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500', 4.4, 380, true, false, true, 'new'),

  -- Buku & Alat Tulis
  ('33333333-3333-3333-3333-333333333320', '22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111110',
   'Notebook Premium A5 Hardcover', 'Notebook dengan cover hardcover premium, kertas 100gsm, 200 halaman.',
   'BOOK-NP020', 'WriteWell', 300, 89000, 120000, 26, 200, 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500', 4.7, 650, true, false, true, 'new')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 4. SAMPLE BANNERS
-- =============================================
INSERT INTO banners (id, title, subtitle, description, image, bg_color, button_text, button_link, position, is_active) VALUES
  ('44444444-4444-4444-4444-444444444401', 'Promo Akhir Tahun', 'Diskon Hingga 50%', 'Belanja hemat dengan diskon besar di semua kategori. Jangan sampai kehabisan!', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', 'from-primary to-primary/80', 'Belanja Sekarang', '/products', 1, true),
  ('44444444-4444-4444-4444-444444444402', 'Gadget Terbaru', 'Teknologi Canggih', 'Temukan smartphone, laptop, dan gadget terbaru dengan harga terjangkau.', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200', 'from-blue-600 to-blue-800', 'Lihat Koleksi', '/products?category=elektronik', 2, true),
  ('44444444-4444-4444-4444-444444444403', 'Fashion Update', 'Trend Terkini', 'Update penampilanmu dengan koleksi fashion terbaru. Style keren harga bersahabat.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200', 'from-pink-600 to-purple-600', 'Explore Fashion', '/products?category=fashion-pria', 3, true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- DONE! Seed data inserted
-- =============================================
