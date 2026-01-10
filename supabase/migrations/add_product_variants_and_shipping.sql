-- Migration: Add advanced product fields and variant support (FIXED)
-- Run this in Supabase SQL Editor

-- ============================================
-- PART 1: Update products table
-- ============================================

-- Video & Media
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Purchase Limits
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS min_purchase INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS max_purchase INTEGER;

-- Shipping Information (weight in grams, dimensions in cm)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS weight_grams DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS length_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS width_cm DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(10,2);

-- Note: 'condition', 'sku', 'brand' already exist, skipping

-- Identification
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gtin VARCHAR(50); -- Global Trade Item Number / Barcode

-- Specifications
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS origin_country VARCHAR(50),
ADD COLUMN IF NOT EXISTS warranty_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS warranty_period VARCHAR(50);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_products_gtin ON products(gtin);

-- Add comments
COMMENT ON COLUMN products.video_url IS 'Product video URL (optional, max 30MB, 10-60 seconds)';
COMMENT ON COLUMN products.weight_grams IS 'Product weight in grams (required for shipping)';
COMMENT ON COLUMN products.gtin IS 'Global Trade Item Number (barcode)';


-- ============================================
-- PART 2: Create product_variants table
-- ============================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Variant Type & Value
  variant_type VARCHAR(50) NOT NULL, -- 'color', 'size', 'material', etc
  variant_value VARCHAR(100) NOT NULL, -- 'Red', 'XL', 'Cotton', etc
  
  -- Display
  display_order INTEGER DEFAULT 0,
  
  -- Variant-specific data
  price_adjustment DECIMAL(10,2) DEFAULT 0, -- Price difference from base price
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100), -- Variant-specific SKU
  image_url TEXT, -- Variant-specific image (e.g., color swatch)
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(product_id, variant_type, variant_value)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_type ON product_variants(variant_type);

COMMENT ON TABLE product_variants IS 'Individual variant options for products (e.g., colors, sizes)';


-- ============================================
-- PART 3: Create product_variant_combinations table
-- ============================================

CREATE TABLE IF NOT EXISTS product_variant_combinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Combination (stored as JSON array)
  -- Example: [{"type": "color", "value": "Red"}, {"type": "size", "value": "XL"}]
  combination JSONB NOT NULL,
  
  -- Stock & Pricing
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_variant_combinations_product_id ON product_variant_combinations(product_id);
CREATE INDEX IF NOT EXISTS idx_variant_combinations_combination ON product_variant_combinations USING GIN(combination);

COMMENT ON TABLE product_variant_combinations IS 'Combinations of multiple variants with specific price and stock';
COMMENT ON COLUMN product_variant_combinations.combination IS 'JSON array of variant type-value pairs';


-- ============================================
-- PART 4: Create shipping_options table
-- ============================================

CREATE TABLE IF NOT EXISTS shipping_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Courier Info
  courier_name VARCHAR(100) NOT NULL, -- 'JNE', 'J&T', 'SiCepat', 'Grab', etc
  service_type VARCHAR(100), -- 'Regular', 'Express', 'Next Day', 'Same Day'
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  per_kg_price DECIMAL(10,2), -- For weight-based pricing
  
  -- Constraints
  min_weight DECIMAL(10,2), -- Minimum weight in grams
  max_weight DECIMAL(10,2), -- Maximum weight in grams
  estimated_days VARCHAR(50), -- '1-2 hari', '3-5 hari'
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipping_options_product_id ON shipping_options(product_id);
CREATE INDEX IF NOT EXISTS idx_shipping_options_courier ON shipping_options(courier_name);

COMMENT ON TABLE shipping_options IS 'Available shipping/courier options for products';


-- ============================================
-- PART 5: Enable RLS (Row Level Security)
-- ============================================

-- Enable RLS on new tables
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variant_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_options ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_variants
CREATE POLICY "Anyone can view active variants" ON product_variants
  FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage variants" ON product_variants
  FOR ALL USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- RLS Policies for product_variant_combinations
CREATE POLICY "Anyone can view active combinations" ON product_variant_combinations
  FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage combinations" ON product_variant_combinations
  FOR ALL USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- RLS Policies for shipping_options
CREATE POLICY "Anyone can view active shipping" ON shipping_options
  FOR SELECT USING (is_active = true);

CREATE POLICY "Store owners can manage shipping" ON shipping_options
  FOR ALL USING (
    product_id IN (
      SELECT id FROM products WHERE store_id IN (
        SELECT id FROM stores WHERE owner_id = auth.uid()
      )
    )
  );

-- ============================================
-- Success Message
-- ============================================
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created/updated:';
  RAISE NOTICE '  - products (updated with new columns)';
  RAISE NOTICE '  - product_variants';
  RAISE NOTICE '  - product_variant_combinations';
  RAISE NOTICE '  - shipping_options';
END $$;
