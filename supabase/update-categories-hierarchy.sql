-- =============================================
-- UPDATE CATEGORIES TABLE FOR HIERARCHY
-- =============================================
-- This migration updates categories table to support
-- full hierarchy from data-kategori-jadi.json

-- Drop existing constraints
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_parent_id_fkey;
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_slug_key;

-- Modify existing columns to support longer values
ALTER TABLE categories 
ALTER COLUMN name TYPE VARCHAR(500),
ALTER COLUMN slug TYPE VARCHAR(500);

-- Add new columns for category hierarchy
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS category_data_id INTEGER UNIQUE,
ADD COLUMN IF NOT EXISTS main_category VARCHAR(200),
ADD COLUMN IF NOT EXISTS sub1 VARCHAR(200),
ADD COLUMN IF NOT EXISTS sub2 VARCHAR(200),
ADD COLUMN IF NOT EXISTS sub3 VARCHAR(200),
ADD COLUMN IF NOT EXISTS sub4 VARCHAR(200),
ADD COLUMN IF NOT EXISTS image1 VARCHAR(500),
ADD COLUMN IF NOT EXISTS image2 VARCHAR(500),
ADD COLUMN IF NOT EXISTS image3 VARCHAR(500),
ADD COLUMN IF NOT EXISTS image4 VARCHAR(500);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_data_id ON categories(category_data_id);
CREATE INDEX IF NOT EXISTS idx_categories_main ON categories(main_category);
CREATE INDEX IF NOT EXISTS idx_categories_sub1 ON categories(sub1);
CREATE INDEX IF NOT EXISTS idx_categories_sub2 ON categories(sub2);

-- Add comments for documentation
COMMENT ON COLUMN categories.category_data_id IS 'ID from data-kategori-jadi.json (id kategori field)';
COMMENT ON COLUMN categories.main_category IS 'Main category (kategori field)';
COMMENT ON COLUMN categories.sub1 IS 'First subcategory level (kategori-1)';
COMMENT ON COLUMN categories.sub2 IS 'Second subcategory level (kategori-2)';
COMMENT ON COLUMN categories.sub3 IS 'Third subcategory level (kategori-3)';
COMMENT ON COLUMN categories.sub4 IS 'Fourth subcategory level (kategori-4)';
COMMENT ON COLUMN categories.image1 IS 'First image URL (gbr-1)';
COMMENT ON COLUMN categories.image2 IS 'Second image URL (gbr-2)';
COMMENT ON COLUMN categories.image3 IS 'Third image URL (gbr-3)';
COMMENT ON COLUMN categories.image4 IS 'Fourth image URL (4)';

-- Create function to get full category path
CREATE OR REPLACE FUNCTION get_category_path(cat_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  rec RECORD;
BEGIN
  SELECT main_category, sub1, sub2, sub3, sub4
  INTO rec
  FROM categories
  WHERE category_data_id = cat_id;
  
  result := rec.main_category;
  IF rec.sub1 IS NOT NULL AND rec.sub1 != '-' THEN
    result := result || ' > ' || rec.sub1;
  END IF;
  IF rec.sub2 IS NOT NULL AND rec.sub2 != '-' THEN
    result := result || ' > ' || rec.sub2;
  END IF;
  IF rec.sub3 IS NOT NULL AND rec.sub3 != '-' THEN
    result := result || ' > ' || rec.sub3;
  END IF;
  IF rec.sub4 IS NOT NULL AND rec.sub4 != '-' THEN
    result := result || ' > ' || rec.sub4;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
