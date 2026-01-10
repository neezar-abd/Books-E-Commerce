-- Drop existing categories table if it exists
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table with proper structure for e-commerce
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_data_id INTEGER UNIQUE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  main_category TEXT NOT NULL,
  sub1 TEXT,
  sub2 TEXT,
  sub3 TEXT,
  sub4 TEXT,
  image TEXT,
  image1 TEXT,
  image2 TEXT,
  image3 TEXT,
  image4 TEXT,
  is_active BOOLEAN DEFAULT true,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_main ON categories(main_category);
CREATE INDEX idx_categories_sub1 ON categories(sub1);
CREATE INDEX idx_categories_sub2 ON categories(sub2);
CREATE INDEX idx_categories_data_id ON categories(category_data_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Categories are viewable by everyone" 
  ON categories FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert categories" 
  ON categories FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories" 
  ON categories FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete categories" 
  ON categories FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
