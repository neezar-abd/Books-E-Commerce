-- =============================================
-- MARKETPLACE MULTI-SELLER MIGRATION
-- Uchinaga Books - Transform to Marketplace
-- =============================================

-- =============================================
-- 1. STORES TABLE (Seller Shops)
-- =============================================
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo VARCHAR(500),
  banner VARCHAR(500),
  description TEXT,
  city VARCHAR(100),
  province VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_products INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  verification_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  verification_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for stores
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_active ON stores(is_active);
CREATE INDEX IF NOT EXISTS idx_stores_verified ON stores(is_verified);

-- =============================================
-- 2. STORE REVIEWS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS store_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(store_id, user_id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_store_reviews_store ON store_reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_user ON store_reviews(user_id);

-- =============================================
-- 3. ADD store_id TO PRODUCTS TABLE
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'store_id'
  ) THEN
    ALTER TABLE products ADD COLUMN store_id UUID REFERENCES stores(id) ON DELETE SET NULL;
    CREATE INDEX idx_products_store ON products(store_id);
  END IF;
END $$;

-- =============================================
-- 4. ORDER STORES TABLE (Split orders by store)
-- =============================================
CREATE TABLE IF NOT EXISTS order_stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
  
  -- Store snapshot (in case store changes)
  store_name VARCHAR(255) NOT NULL,
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Status (separate from main order)
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
  tracking_number VARCHAR(100),
  shipping_carrier VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_order_stores_order ON order_stores(order_id);
CREATE INDEX IF NOT EXISTS idx_order_stores_store ON order_stores(store_id);
CREATE INDEX IF NOT EXISTS idx_order_stores_status ON order_stores(status);

-- =============================================
-- 5. UPDATE PROFILES ROLE (Add seller)
-- =============================================
DO $$
BEGIN
  -- Drop existing constraint if exists
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  
  -- Add new constraint with 'seller' role
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'seller', 'admin'));
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Could not update role constraint: %', SQLERRM;
END $$;

-- =============================================
-- 6. SELLER PAYOUTS TABLE (Optional - for tracking earnings)
-- =============================================
CREATE TABLE IF NOT EXISTS seller_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  account_name VARCHAR(255),
  note TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_payouts_store ON seller_payouts(store_id);

-- =============================================
-- 7. RLS POLICIES FOR STORES
-- =============================================
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_payouts ENABLE ROW LEVEL SECURITY;

-- Stores: Public can view active stores
CREATE POLICY "Anyone can view active stores" ON stores
  FOR SELECT USING (is_active = true AND is_verified = true);

-- Stores: Sellers can view and update own store
CREATE POLICY "Sellers can view own store" ON stores
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Sellers can update own store" ON stores
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can create store" ON stores
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Stores: Admins can manage all stores
CREATE POLICY "Admins can manage all stores" ON stores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Store Reviews: Anyone can view
CREATE POLICY "Anyone can view store reviews" ON store_reviews
  FOR SELECT USING (true);

-- Store Reviews: Users can manage own reviews
CREATE POLICY "Users can manage own store reviews" ON store_reviews
  FOR ALL USING (auth.uid() = user_id);

-- Order Stores: Sellers can view own store orders
CREATE POLICY "Sellers can view own store orders" ON order_stores
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = order_stores.store_id AND stores.owner_id = auth.uid())
  );

-- Order Stores: Sellers can update own store orders (for shipping)
CREATE POLICY "Sellers can update own store orders" ON order_stores
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = order_stores.store_id AND stores.owner_id = auth.uid())
  );

-- Order Stores: Admins can manage all
CREATE POLICY "Admins can manage all order_stores" ON order_stores
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Seller Payouts: Sellers can view own payouts
CREATE POLICY "Sellers can view own payouts" ON seller_payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = seller_payouts.store_id AND stores.owner_id = auth.uid())
  );

-- Seller Payouts: Admins can manage all
CREATE POLICY "Admins can manage payouts" ON seller_payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 8. UPDATE PRODUCTS POLICY FOR SELLERS
-- =============================================
-- Sellers can insert products for their store
CREATE POLICY "Sellers can insert own products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

-- Sellers can update their own products
CREATE POLICY "Sellers can update own products" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

-- Sellers can delete their own products
CREATE POLICY "Sellers can delete own products" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM stores WHERE stores.id = products.store_id AND stores.owner_id = auth.uid())
  );

-- =============================================
-- 9. TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_reviews_updated_at BEFORE UPDATE ON store_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_stores_updated_at BEFORE UPDATE ON order_stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 10. FUNCTION TO UPDATE STORE STATS
-- =============================================
CREATE OR REPLACE FUNCTION update_store_product_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE stores SET total_products = total_products + 1 WHERE id = NEW.store_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE stores SET total_products = total_products - 1 WHERE id = OLD.store_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_store_product_count_trigger
  AFTER INSERT OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION update_store_product_count();

-- =============================================
-- DONE! 
-- Run this SQL in Supabase SQL Editor
-- =============================================
