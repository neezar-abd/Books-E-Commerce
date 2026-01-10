-- =============================================
-- Indonesia Location System - Database Migration
-- Adds provinces and cities tables
-- =============================================

-- Create provinces table
CREATE TABLE IF NOT EXISTS provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- "Jawa Barat (JABAR)"
  short_name TEXT,                     -- "JABAR"
  slug TEXT UNIQUE NOT NULL,           -- "jawa-barat"
  zone TEXT,                           -- "Java", "Sumatra", etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cities table
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,                  -- "Kota Bandung"
  type TEXT NOT NULL,                  -- "Kota" or "Kabupaten"
  slug TEXT NOT NULL,                  -- "kota-bandung"
  postal_code_prefix TEXT,             -- "40" for Bandung area
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(province_id, name)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cities_province ON cities(province_id);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_cities_type ON cities(type);
CREATE INDEX IF NOT EXISTS idx_provinces_slug ON provinces(slug);

-- Create trigger for updated_at on provinces
CREATE OR REPLACE FUNCTION update_provinces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_provinces_timestamp
  BEFORE UPDATE ON provinces
  FOR EACH ROW
  EXECUTE FUNCTION update_provinces_updated_at();

-- Create trigger for updated_at on cities
CREATE OR REPLACE FUNCTION update_cities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cities_timestamp
  BEFORE UPDATE ON cities
  FOR EACH ROW
  EXECUTE FUNCTION update_cities_updated_at();

-- Enable RLS
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provinces (public read, admin write)
CREATE POLICY "Provinces are viewable by everyone"
  ON provinces FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert provinces"
  ON provinces FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update provinces"
  ON provinces FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for cities (public read, admin write)
CREATE POLICY "Cities are viewable by everyone"
  ON cities FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert cities"
  ON cities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update cities"
  ON cities FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add helpful functions
CREATE OR REPLACE FUNCTION get_cities_by_province(province_slug TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, c.type, c.slug
  FROM cities c
  JOIN provinces p ON c.province_id = p.id
  WHERE p.slug = province_slug
  ORDER BY c.type DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql;
