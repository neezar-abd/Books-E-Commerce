-- Add category-related columns to brands table
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS category_name TEXT,
ADD COLUMN IF NOT EXISTS subcategory_name TEXT,
ADD COLUMN IF NOT EXISTS category_id BIGINT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_brands_category_name ON brands(category_name);
CREATE INDEX IF NOT EXISTS idx_brands_is_active ON brands(is_active);

-- Add comment for documentation
COMMENT ON COLUMN brands.category_name IS 'Main category name (e.g., Elektronik, Fashion)';
COMMENT ON COLUMN brands.subcategory_name IS 'Subcategory name (e.g., Handphone & Aksesoris)';
COMMENT ON COLUMN brands.category_id IS 'Reference to category ID from Excel data';
COMMENT ON COLUMN brands.is_active IS 'Whether the brand is active/visible';
