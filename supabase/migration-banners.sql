-- =============================================
-- BANNERS TABLE for Homepage Carousel
-- =============================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  image VARCHAR(500) NOT NULL,
  bg_color VARCHAR(100) DEFAULT 'from-primary to-primary/80',
  button_text VARCHAR(100) DEFAULT 'Belanja Sekarang',
  button_link VARCHAR(255) DEFAULT '/products',
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active banners" ON banners
  FOR SELECT USING (is_active = true);

-- Admins can manage banners
CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger for updated_at
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default banners
INSERT INTO banners (title, subtitle, description, image, bg_color, position) VALUES
('Promo Akhir Tahun', 'Diskon Hingga 50%', 'Belanja buku favorit dengan harga spesial', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'from-primary to-primary/80', 1),
('Koleksi Terbaru', 'New Arrivals 2025', 'Temukan buku-buku terbaru pilihan editor', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'from-secondary to-secondary/80', 2),
('Flash Sale', 'Hanya Hari Ini', 'Jangan lewatkan penawaran terbatas', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'from-red-500 to-red-600', 3);
