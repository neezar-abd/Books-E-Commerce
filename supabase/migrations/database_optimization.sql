-- ============================================
-- Database Optimization Migration
-- Version: 2.0
-- Purpose: Add indexes, cleanup duplicates, add missing tables
-- ============================================

-- ============================================
-- PART 1: PERFORMANCE INDEXES
-- ============================================

-- Products indexes (most queried table)
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_moderation_status ON products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_total_sold ON products(total_sold DESC);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_store_id ON order_items(store_id);

-- Cart indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- Categories indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active) WHERE is_active = true;

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON stores(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_stores_verification_status ON stores(verification_status);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_type ON product_variants(variant_type);

-- Product combinations indexes
CREATE INDEX IF NOT EXISTS idx_product_combinations_product_id ON product_variant_combinations(product_id);

-- Shipping options indexes
CREATE INDEX IF NOT EXISTS idx_shipping_options_product_id ON shipping_options(product_id);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- PART 2: CLEANUP DUPLICATE COLUMNS
-- ============================================

-- Remove duplicate image columns from categories (keep image_1, image_2, etc)
ALTER TABLE categories DROP COLUMN IF EXISTS image1;
ALTER TABLE categories DROP COLUMN IF EXISTS image2;
ALTER TABLE categories DROP COLUMN IF EXISTS image3;
ALTER TABLE categories DROP COLUMN IF EXISTS image4;

-- Remove duplicate weight column from products (keep weight_grams)
-- First migrate data if weight has values but weight_grams doesn't
UPDATE products 
SET weight_grams = weight 
WHERE weight_grams IS NULL AND weight IS NOT NULL AND weight > 0;

-- Now drop the old column
ALTER TABLE products DROP COLUMN IF EXISTS weight;

-- Remove denormalized category columns from products (keep category_id FK)
-- These are redundant if using proper FK relationship
ALTER TABLE products DROP COLUMN IF EXISTS category_main;
ALTER TABLE products DROP COLUMN IF EXISTS category_sub1;
ALTER TABLE products DROP COLUMN IF EXISTS category_sub2;
ALTER TABLE products DROP COLUMN IF EXISTS category_sub3;

-- Remove duplicate category columns from categories table
ALTER TABLE categories DROP COLUMN IF EXISTS main_category;
ALTER TABLE categories DROP COLUMN IF EXISTS sub1;
ALTER TABLE categories DROP COLUMN IF EXISTS sub2;
ALTER TABLE categories DROP COLUMN IF EXISTS sub3;
ALTER TABLE categories DROP COLUMN IF EXISTS sub4;

-- ============================================
-- PART 3: ADD MISSING TABLES
-- ============================================

-- Wishlist table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT wishlists_pkey PRIMARY KEY (id),
  CONSTRAINT wishlists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT wishlists_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT wishlists_unique UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  type character varying NOT NULL, -- 'order', 'promo', 'system', 'chat'
  title character varying NOT NULL,
  message text,
  data jsonb, -- Additional data like order_id, product_id, etc
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Conversations table (buyer-seller chat)
CREATE TABLE IF NOT EXISTS conversations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  buyer_id uuid NOT NULL,
  store_id uuid NOT NULL,
  product_id uuid, -- Optional: conversation about specific product
  last_message_at timestamp with time zone DEFAULT now(),
  last_message_preview text,
  buyer_unread_count integer DEFAULT 0,
  seller_unread_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT conversations_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT conversations_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  CONSTRAINT conversations_unique UNIQUE (buyer_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer_id ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_store_id ON conversations(store_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  message_type character varying DEFAULT 'text', -- 'text', 'image', 'product'
  attachment_url text,
  product_id uuid, -- If sharing a product
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT messages_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- Coupons/Vouchers table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  discount_type character varying NOT NULL DEFAULT 'percentage', -- 'percentage', 'fixed'
  discount_value numeric NOT NULL,
  min_purchase numeric DEFAULT 0,
  max_discount numeric, -- Max discount for percentage type
  usage_limit integer, -- Total usage limit
  usage_count integer DEFAULT 0,
  per_user_limit integer DEFAULT 1,
  store_id uuid, -- NULL = platform-wide, specific store_id = store coupon
  category_id uuid, -- NULL = all categories
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupons_pkey PRIMARY KEY (id),
  CONSTRAINT coupons_store_id_fkey FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT coupons_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT coupons_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active) WHERE is_active = true;

-- Coupon usage tracking
CREATE TABLE IF NOT EXISTS coupon_usages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  coupon_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_id uuid NOT NULL,
  discount_amount numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT coupon_usages_pkey PRIMARY KEY (id),
  CONSTRAINT coupon_usages_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT coupon_usages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT coupon_usages_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usages_user_id ON coupon_usages(user_id);

-- ============================================
-- PART 4: RLS POLICIES FOR NEW TABLES
-- ============================================

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can view own wishlists" ON wishlists 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to own wishlist" ON wishlists 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove from own wishlist" ON wishlists 
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications 
  FOR UPDATE USING (auth.uid() = user_id);

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations 
  FOR SELECT USING (
    auth.uid() = buyer_id OR 
    auth.uid() IN (SELECT owner_id FROM stores WHERE id = store_id)
  );

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON messages 
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = auth.uid() OR 
      store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    )
  );
CREATE POLICY "Users can send messages in their conversations" ON messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE buyer_id = auth.uid() OR 
      store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    )
  );

-- Coupons policies (public read for active coupons)
CREATE POLICY "Anyone can view active coupons" ON coupons 
  FOR SELECT USING (is_active = true);
CREATE POLICY "Store owners can manage their coupons" ON coupons 
  FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'superadmin'))
  );

-- ============================================
-- PART 5: HELPFUL VIEWS
-- ============================================

-- Product with store info (commonly used)
CREATE OR REPLACE VIEW products_with_store AS
SELECT 
  p.*,
  s.name as store_name,
  s.slug as store_slug,
  s.city as store_city,
  s.is_verified as store_verified
FROM products p
LEFT JOIN stores s ON p.store_id = s.id;

-- Order summary view
CREATE OR REPLACE VIEW order_summary AS
SELECT 
  o.*,
  COUNT(oi.id) as item_count,
  array_agg(DISTINCT oi.store_id) as store_ids
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- ============================================
-- DONE!
-- ============================================
