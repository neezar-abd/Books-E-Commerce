# 📸 Image Upload Feature - Setup Guide

## Overview
Sistem upload gambar terintegrasi dengan Supabase Storage untuk produk e-commerce.

## 🚀 Setup Supabase Storage

### 1. Jalankan SQL Script
Buka **Supabase SQL Editor** dan jalankan file `supabase/setup-storage.sql`:

```sql
-- Ini akan membuat:
-- ✅ Storage bucket 'products'
-- ✅ Public access untuk melihat gambar
-- ✅ Admin-only policies untuk upload/edit/delete
```

### 2. Verifikasi Storage Bucket
Di Supabase Dashboard:
1. Buka **Storage** → Buckets
2. Pastikan bucket **"products"** sudah ada
3. Bucket settings:
   - ✅ Public: Yes
   - ✅ File size limit: 5MB
   - ✅ Allowed MIME types: JPEG, PNG, WEBP, GIF

### 3. Test Upload Permissions
Login sebagai admin dan coba upload gambar di halaman Products.

---

## 🎨 Komponen yang Dibuat

### 1. `ImageUpload.tsx`
Komponen reusable untuk upload gambar dengan:
- ✅ Drag & drop support
- ✅ Image preview dengan overlay actions
- ✅ File validation (type & size)
- ✅ Upload progress indicator
- ✅ Error handling
- ✅ Smooth animations dengan Framer Motion

**Props:**
```typescript
interface ImageUploadProps {
  value?: string;              // Current image URL
  onChange: (url: string) => void;  // Callback saat image berubah
  onUpload?: (file: File) => Promise<string>;  // Upload handler
  bucket?: string;             // Storage bucket name (default: 'products')
  maxSize?: number;            // Max file size in MB (default: 5)
  acceptedFormats?: string[];  // Accepted MIME types
}
```

### 2. Storage Functions (`lib/admin.ts`)
```typescript
// Upload gambar ke Supabase Storage
uploadProductImage(file: File): Promise<string>

// Hapus gambar dari Storage
deleteProductImage(imageUrl: string): Promise<void>

// List semua gambar di bucket
listProductImages(): Promise<FileObject[]>
```

---

## 📝 Cara Penggunaan

### Di Product Form
```tsx
import ImageUpload from '@/components/ImageUpload';
import { uploadProductImage } from '@/lib/admin';

<ImageUpload
  value={formData.image}
  onChange={(url) => setFormData({ ...formData, image: url })}
  onUpload={uploadProductImage}
  bucket="products"
  maxSize={5}
/>
```

### Upload Flow
1. User klik upload area atau drag & drop file
2. Validasi file (type & size)
3. Preview gambar langsung
4. Upload ke Supabase Storage
5. Dapat public URL
6. Update form data dengan URL

---

## 🔧 Features

### ✅ Upload Features
- **Instant Preview**: Melihat gambar sebelum upload
- **Progress Indicator**: Loading animation saat upload
- **Error Handling**: Validasi dan error messages
- **File Validation**: 
  - Type: JPG, PNG, WEBP, GIF
  - Size: Max 5MB
- **Unique Filenames**: Timestamp + random string untuk avoid conflicts

### ✅ UI Features
- **Hover Actions**: Tombol change/remove saat hover
- **Smooth Animations**: Framer Motion transitions
- **Responsive Design**: Mobile-friendly
- **Dark Overlay**: Hover effect untuk better UX

### ✅ Storage Features
- **Public Access**: Gambar bisa diakses tanpa auth
- **Admin Only Upload**: Hanya admin bisa upload/delete
- **CDN Ready**: Supabase Storage otomatis pakai CDN
- **Auto Cleanup**: Bisa implement auto delete old images

---

## 🎯 Next Steps

### Tambahan yang Bisa Diimplementasikan:

1. **Image Optimization**
   - Compress gambar sebelum upload
   - Generate thumbnails otomatis
   - WebP conversion untuk performa

2. **Multiple Images**
   - Gallery upload untuk produk
   - Sortable image order
   - Primary image selector

3. **Image Editor**
   - Crop & resize dalam component
   - Filters & adjustments
   - Text overlay

4. **Storage Management**
   - Admin page untuk manage semua images
   - Bulk delete unused images
   - Storage usage statistics

---

## 🔐 Security Notes

### Policies yang Sudah Diimplementasi:
- ✅ **Public Read**: Semua orang bisa lihat gambar produk
- ✅ **Admin Upload**: Hanya admin bisa upload baru
- ✅ **Admin Update**: Hanya admin bisa update existing
- ✅ **Admin Delete**: Hanya admin bisa hapus

### File Validation:
- ✅ **Client-side**: Validasi type & size di browser
- ✅ **Server-side**: Supabase juga validate MIME type
- ✅ **Unique Names**: Prevent file overwrite

---

## 📊 Storage Limits

### Supabase Free Tier:
- Storage: **1GB**
- Bandwidth: **2GB/month**
- File size: **50MB max** (kita set 5MB)

### Estimasi Kapasitas:
- Rata-rata image size: **500KB**
- Total images: **~2000 images** dalam 1GB
- Cukup untuk e-commerce menengah

### Tips Optimasi:
1. Compress images sebelum upload
2. Use WebP format (40% smaller)
3. Implement image cleanup untuk old/unused images
4. Monitor usage di Supabase Dashboard

---

## 🐛 Troubleshooting

### Error: "Upload failed"
- ✅ Check user is logged in as admin
- ✅ Verify storage bucket exists
- ✅ Check RLS policies di Storage
- ✅ Verify file size < 5MB

### Error: "Invalid file type"
- ✅ Only accept: JPG, PNG, WEBP, GIF
- ✅ Check file extension & MIME type

### Preview tidak muncul
- ✅ Check browser console for errors
- ✅ Verify FileReader API support
- ✅ Check file is valid image

### Public URL tidak bisa diakses
- ✅ Verify bucket is public
- ✅ Check RLS policy "Public can view"
- ✅ Test URL di browser incognito

---

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [File Upload Best Practices](https://web.dev/file-upload/)

---

## ✨ Summary

**Yang Sudah Dibuat:**
1. ✅ Storage bucket setup SQL
2. ✅ ImageUpload component dengan preview & validation
3. ✅ Upload functions di lib/admin.ts
4. ✅ Integration ke Products form
5. ✅ RLS policies untuk security

**Ready to Use!** 🎉
Upload gambar sekarang sudah fully functional dan secure!
