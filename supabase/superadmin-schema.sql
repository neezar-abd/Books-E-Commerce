-- =============================================
-- SUPERADMIN FEATURES - DATABASE SCHEMA
-- Run this to add superadmin-related tables and columns
-- =============================================

-- =============================================
-- 1. UPDATE PRODUCTS TABLE
-- =============================================

-- Add moderation fields to products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'approved' 
  CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'blocked'));

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS moderation_note TEXT;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES profiles(id);

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_flagged BOOLEAN DEFAULT false;

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS flagged_reason TEXT;

-- Set existing products as approved (grandfathered in)
UPDATE products SET moderation_status = 'approved' WHERE moderation_status IS NULL;

-- =============================================
-- 2. UPDATE STORES TABLE
-- =============================================

-- Add verification fields to stores
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified' 
  CHECK (verification_status IN ('pending', 'verified', 'rejected', 'suspended'));

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS verification_note TEXT;

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ;

-- Set existing stores as verified (grandfathered in)
UPDATE stores SET verification_status = 'verified' WHERE verification_status IS NULL;

-- =============================================
-- 3. CREATE COMMISSION SETTINGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS commission_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) DEFAULT 5.00, -- percentage
  is_global BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default global commission (5%)
INSERT INTO commission_settings (is_global, commission_rate) 
VALUES (true, 5.00)
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE commission_settings ENABLE ROW LEVEL SECURITY;

-- Policies for commission_settings
CREATE POLICY "Anyone can view commission settings" ON commission_settings 
  FOR SELECT USING (true);

CREATE POLICY "Only superadmin can manage commission settings" ON commission_settings 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
  );

-- =============================================
-- 4. CREATE BANNED KEYWORDS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS banned_keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword TEXT NOT NULL,
  severity TEXT DEFAULT 'warning' CHECK (severity IN ('warning', 'block', 'report')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(keyword)
);

-- Enable RLS
ALTER TABLE banned_keywords ENABLE ROW LEVEL SECURITY;

-- Policies for banned_keywords
CREATE POLICY "Anyone can view banned keywords" ON banned_keywords 
  FOR SELECT USING (true);

CREATE POLICY "Only superadmin can manage banned keywords" ON banned_keywords 
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
  );

-- Insert default banned keywords (Indonesian)
INSERT INTO banned_keywords (keyword, severity) VALUES
  ('narkoba', 'block'),
  ('narkotika', 'block'),
  ('ganja', 'block'),
  ('marijuana', 'block'),
  ('sabu', 'block'),
  ('ekstasi', 'block'),
  ('heroin', 'block'),
  ('kokain', 'block'),
  ('senjata api', 'block'),
  ('pistol', 'report'),
  ('senapan', 'report'),
  ('amunisi', 'report'),
  ('peluru', 'report'),
  ('bom', 'block'),
  ('peledak', 'block'),
  ('racun', 'report'),
  ('pornografi', 'block'),
  ('judi', 'report'),
  ('perjudian', 'report'),
  ('palsu', 'warning'),
  ('kw', 'warning'),
  ('replika', 'warning'),
  ('bajakan', 'warning'),
  ('ilegal', 'warning')
ON CONFLICT (keyword) DO NOTHING;

-- =============================================
-- 5. CREATE AUDIT LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id),
  admin_email TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL, -- 'product', 'store', 'user', 'order', 'settings'
  target_id UUID,
  target_name TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs (only superadmin can view)
CREATE POLICY "Only superadmin can view audit logs" ON audit_logs 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
  );

CREATE POLICY "Only superadmin can insert audit logs" ON audit_logs 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin'))
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);

-- =============================================
-- 6. CREATE INDEXES FOR MODERATION QUERIES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_products_moderation_status ON products(moderation_status);
CREATE INDEX IF NOT EXISTS idx_products_is_flagged ON products(is_flagged);
CREATE INDEX IF NOT EXISTS idx_stores_verification_status ON stores(verification_status);

-- =============================================
-- 7. VERIFICATION QUERIES
-- =============================================

-- Check products table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('moderation_status', 'moderation_note', 'is_flagged');

-- Check stores table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'stores' 
AND column_name IN ('verification_status', 'verification_note', 'suspension_reason');

-- Check new tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('commission_settings', 'banned_keywords', 'audit_logs');

-- Check banned keywords count
SELECT COUNT(*) as banned_keywords_count FROM banned_keywords;

SELECT 'Schema update completed successfully!' as status;
