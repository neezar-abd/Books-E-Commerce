-- ================================================
-- Brands System Migration
-- Purpose: Create brands table and migrate existing brand data
-- ================================================

-- ================================================
-- STEP 1: CREATE BRANDS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS brands (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying NOT NULL UNIQUE,
  slug character varying NOT NULL UNIQUE,
  logo text,
  description text,
  website character varying,
  
  -- Metadata
  is_verified boolean DEFAULT false,
  is_official boolean DEFAULT false, -- Official brand store
  is_active boolean DEFAULT true,
  product_count integer DEFAULT 0,
  total_sold integer DEFAULT 0,
  
  -- SEO
  meta_title character varying,
  meta_description text,
  
  -- Stats
  avg_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  
  -- Origin
  country character varying,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT brands_pkey PRIMARY KEY (id)
);

-- ================================================
-- STEP 2: ADD BRAND_ID TO PRODUCTS
-- ================================================

-- Add brand_id column to products (nullable for now)
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brands(id) ON DELETE SET NULL;

-- ================================================
-- STEP 3: CREATE INDEXES
-- ================================================

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_brands_is_verified ON brands(is_verified) WHERE is_verified = true;
CREATE INDEX IF NOT EXISTS idx_brands_product_count ON brands(product_count DESC);

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);

-- ================================================
-- STEP 4: AUTO-POPULATE BRANDS FROM PRODUCTS
-- ================================================

-- Function to generate slug from brand name
CREATE OR REPLACE FUNCTION generate_brand_slug(brand_name text)
RETURNS text AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        TRIM(brand_name),
        '[^a-zA-Z0-9\s-]', '', 'g'  -- Remove special chars
      ),
      '\s+', '-', 'g'  -- Replace spaces with hyphens
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Insert unique brands from existing products
INSERT INTO brands (name, slug, product_count)
SELECT 
  TRIM(brand) as name,
  generate_brand_slug(TRIM(brand)) as slug,
  COUNT(*) as product_count
FROM products
WHERE brand IS NOT NULL 
  AND TRIM(brand) != ''
GROUP BY TRIM(brand)
ON CONFLICT (name) DO NOTHING;

-- Handle slug conflicts by appending numbers
DO $$
DECLARE
  brand_record RECORD;
  new_slug text;
  counter integer;
BEGIN
  FOR brand_record IN 
    SELECT id, name, slug 
    FROM brands 
    WHERE slug IN (
      SELECT slug 
      FROM brands 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    )
  LOOP
    counter := 1;
    new_slug := brand_record.slug || '-' || counter;
    
    WHILE EXISTS (SELECT 1 FROM brands WHERE slug = new_slug) LOOP
      counter := counter + 1;
      new_slug := brand_record.slug || '-' || counter;
    END LOOP;
    
    UPDATE brands 
    SET slug = new_slug 
    WHERE id = brand_record.id;
  END LOOP;
END $$;

-- ================================================
-- STEP 5: LINK PRODUCTS TO BRANDS
-- ================================================

-- Update products with brand_id based on brand name
UPDATE products p
SET brand_id = b.id
FROM brands b
WHERE TRIM(p.brand) = b.name
  AND p.brand_id IS NULL;

-- ================================================
-- STEP 6: UPDATE BRAND STATS
-- ================================================

-- Function to update brand statistics
CREATE OR REPLACE FUNCTION update_brand_stats(brand_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE brands
  SET 
    product_count = (
      SELECT COUNT(*) 
      FROM products 
      WHERE brand_id = brand_uuid AND is_active = true
    ),
    total_sold = (
      SELECT COALESCE(SUM(total_sold), 0)
      FROM products 
      WHERE brand_id = brand_uuid
    ),
    avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM products 
      WHERE brand_id = brand_uuid AND rating > 0
    ),
    review_count = (
      SELECT COALESCE(SUM(review_count), 0)
      FROM products 
      WHERE brand_id = brand_uuid
    ),
    updated_at = now()
  WHERE id = brand_uuid;
END;
$$ LANGUAGE plpgsql;

-- Update all brand stats
DO $$
DECLARE
  brand_record RECORD;
BEGIN
  FOR brand_record IN SELECT id FROM brands LOOP
    PERFORM update_brand_stats(brand_record.id);
  END LOOP;
END $$;

-- ================================================
-- STEP 7: TRIGGERS
-- ================================================

-- Trigger to update brand stats when product changes
CREATE OR REPLACE FUNCTION trigger_update_brand_stats()
RETURNS trigger AS $$
BEGIN
  -- Update old brand if changed
  IF TG_OP = 'UPDATE' AND OLD.brand_id IS DISTINCT FROM NEW.brand_id THEN
    IF OLD.brand_id IS NOT NULL THEN
      PERFORM update_brand_stats(OLD.brand_id);
    END IF;
  END IF;
  
  -- Update new brand
  IF NEW.brand_id IS NOT NULL THEN
    PERFORM update_brand_stats(NEW.brand_id);
  END IF;
  
  -- Update old brand if deleted
  IF TG_OP = 'DELETE' AND OLD.brand_id IS NOT NULL THEN
    PERFORM update_brand_stats(OLD.brand_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_brand_stats ON products;
CREATE TRIGGER trigger_product_brand_stats
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_brand_stats();

-- ================================================
-- STEP 8: RLS POLICIES
-- ================================================

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Anyone can view active brands
CREATE POLICY "Anyone can view active brands" ON brands
  FOR SELECT
  USING (is_active = true);

-- Admins can manage brands
CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role IN ('admin', 'superadmin')
    )
  );

-- ================================================
-- STEP 9: HELPFUL VIEWS
-- ================================================

-- Popular brands view
CREATE OR REPLACE VIEW popular_brands AS
SELECT 
  b.*,
  COUNT(DISTINCT p.id) as active_products,
  COALESCE(SUM(p.total_sold), 0) as total_sales
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id AND p.is_active = true
WHERE b.is_active = true
GROUP BY b.id
ORDER BY total_sales DESC, b.product_count DESC;

-- Products with brand info view
CREATE OR REPLACE VIEW products_with_brand AS
SELECT 
  p.*,
  b.name as brand_name,
  b.slug as brand_slug,
  b.logo as brand_logo,
  b.is_verified as brand_verified
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id;

-- ================================================
-- STEP 10: UTILITY FUNCTIONS
-- ================================================

-- Get or create brand
CREATE OR REPLACE FUNCTION get_or_create_brand(brand_name text)
RETURNS uuid AS $$
DECLARE
  brand_id uuid;
  brand_slug text;
BEGIN
  -- Trim and validate
  brand_name := TRIM(brand_name);
  IF brand_name = '' OR brand_name IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Try to find existing brand
  SELECT id INTO brand_id
  FROM brands
  WHERE name = brand_name;
  
  -- Create if not exists
  IF brand_id IS NULL THEN
    brand_slug := generate_brand_slug(brand_name);
    
    -- Handle slug conflict
    IF EXISTS (SELECT 1 FROM brands WHERE slug = brand_slug) THEN
      brand_slug := brand_slug || '-' || FLOOR(RANDOM() * 1000);
    END IF;
    
    INSERT INTO brands (name, slug)
    VALUES (brand_name, brand_slug)
    RETURNING id INTO brand_id;
  END IF;
  
  RETURN brand_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- STEP 11: SEED POPULAR BRANDS (OPTIONAL)
-- ================================================

-- Add some popular brands with metadata
INSERT INTO brands (name, slug, description, is_verified, country)
VALUES 
  ('Nike', 'nike', 'Just Do It - Leading sports and athletic wear brand', true, 'United States'),
  ('Adidas', 'adidas', 'Impossible is Nothing - Sports apparel and footwear', true, 'Germany'),
  ('Samsung', 'samsung', 'Leading electronics and technology brand', true, 'South Korea'),
  ('Apple', 'apple', 'Think Different - Premium technology products', true, 'United States'),
  ('Xiaomi', 'xiaomi', 'Innovation for Everyone', true, 'China'),
  ('Uniqlo', 'uniqlo', 'LifeWear - Simple, high-quality clothing', true, 'Japan'),
  ('Zara', 'zara', 'Fast fashion retail brand', true, 'Spain'),
  ('H&M', 'hm', 'Fashion and quality at the best price', true, 'Sweden')
ON CONFLICT (name) DO UPDATE
SET 
  is_verified = EXCLUDED.is_verified,
  country = EXCLUDED.country,
  description = EXCLUDED.description;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check migration results
DO $$
BEGIN
  RAISE NOTICE 'Total brands created: %', (SELECT COUNT(*) FROM brands);
  RAISE NOTICE 'Products with brand_id: %', (SELECT COUNT(*) FROM products WHERE brand_id IS NOT NULL);
  RAISE NOTICE 'Products without brand_id: %', (SELECT COUNT(*) FROM products WHERE brand_id IS NULL);
  RAISE NOTICE 'Top 5 brands: %', (
    SELECT string_agg(name || ' (' || product_count || ')', ', ')
    FROM (SELECT name, product_count FROM brands ORDER BY product_count DESC LIMIT 5) top_brands
  );
END $$;

-- ================================================
-- DONE!
-- ================================================

-- NOTES:
-- 1. Old 'brand' column is kept for backward compatibility
-- 2. You can drop it later: ALTER TABLE products DROP COLUMN brand;
-- 3. Brand stats auto-update via triggers
-- 4. Use get_or_create_brand() function when adding products
