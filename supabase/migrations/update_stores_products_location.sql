-- =============================================
-- Update stores table to include location
-- =============================================

-- Add location columns to stores table
ALTER TABLE stores 
  ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES provinces(id),
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id),
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(10);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stores_province ON stores(province_id);
CREATE INDEX IF NOT EXISTS idx_stores_city ON stores(city_id);

-- Add location columns to products table
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS province_id UUID REFERENCES provinces(id),
  ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES cities(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_province ON products(province_id);
CREATE INDEX IF NOT EXISTS idx_products_city ON products(city_id);

-- Create function to auto-populate product location from store
CREATE OR REPLACE FUNCTION auto_populate_product_location()
RETURNS TRIGGER AS $$
BEGIN
  -- If product doesn't have location, copy from store
  IF NEW.province_id IS NULL OR NEW.city_id IS NULL THEN
    SELECT s.province_id, s.city_id
    INTO NEW.province_id, NEW.city_id
    FROM stores s
    WHERE s.id = NEW.store_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-populate product location
DROP TRIGGER IF EXISTS auto_populate_product_location_trigger ON products;
CREATE TRIGGER auto_populate_product_location_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION auto_populate_product_location();
