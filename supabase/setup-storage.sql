-- =============================================
-- Supabase Storage Setup for Product Images
-- =============================================
-- Run this in Supabase SQL Editor
-- This creates a storage bucket and policies for product images

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public to read/view images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Policy: Only admins can upload images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'products' AND
  (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin'
);

-- Policy: Only admins can update images
CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'products' AND
  (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin'
)
WITH CHECK (
  bucket_id = 'products' AND
  (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin'
);

-- Policy: Only admins can delete images
CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'products' AND
  (
    SELECT role FROM profiles WHERE id = auth.uid()
  ) = 'admin'
);

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'products';

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%product images%';
