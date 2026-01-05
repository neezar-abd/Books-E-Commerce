-- =============================================
-- ADD CATEGORY FIELDS TO PRODUCTS TABLE
-- =============================================
-- This migration adds category hierarchy fields to products table
-- to support Shopee-style category filtering

-- Add new columns for category hierarchy
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_main VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_sub1 VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_sub2 VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_sub3 VARCHAR(100),
ADD COLUMN IF NOT EXISTS category_data_id INTEGER;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_category_main ON products(category_main);
CREATE INDEX IF NOT EXISTS idx_products_category_sub1 ON products(category_sub1);
CREATE INDEX IF NOT EXISTS idx_products_category_data_id ON products(category_data_id);

-- Add comments for documentation
COMMENT ON COLUMN products.category_main IS 'Main category from data-kategori-jadi.json (e.g., Pakaian Pria)';
COMMENT ON COLUMN products.category_sub1 IS 'First subcategory level (kategori-1)';
COMMENT ON COLUMN products.category_sub2 IS 'Second subcategory level (kategori-2)';
COMMENT ON COLUMN products.category_sub3 IS 'Third subcategory level (kategori-3)';
COMMENT ON COLUMN products.category_data_id IS 'ID from data-kategori-jadi.json (id kategori field)';
