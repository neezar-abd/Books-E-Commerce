# 🚀 Lumina Books - Supabase Setup Guide

## 📋 Langkah-langkah Setup

### 1. Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com)
2. Sign up / Login
3. Klik "New Project"
4. Isi detail project:
   - **Name**: lumina-books
   - **Database Password**: (simpan ini!)
   - **Region**: Southeast Asia (Singapore)
   - **Pricing Plan**: Free

### 2. Dapatkan API Keys

1. Di dashboard Supabase, ke **Settings** → **API**
2. Copy:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public key** (key yang panjang)
   - **service_role key** (untuk admin operations)

### 3. Update Environment Variables

Buka file `.env.local` dan update:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Schema

1. Di Supabase Dashboard, ke **SQL Editor**
2. Buat query baru
3. Copy semua isi dari `supabase/schema.sql`
4. Paste dan klik **Run**
5. Tunggu sampai selesai (akan create tables, indexes, policies, functions)

### 5. Seed Data (Optional)

1. Masih di SQL Editor
2. Buat query baru lagi
3. Copy semua isi dari `supabase/seed.sql`
4. Paste dan klik **Run**
5. Ini akan populate categories dan sample products

### 6. Setup Authentication

1. Di Supabase Dashboard, ke **Authentication** → **Providers**
2. Enable **Email** provider (sudah default enabled)
3. (Optional) Enable **Google OAuth**:
   - Toggle Google provider
   - Masukkan Google Client ID & Secret
   - Authorized redirect URL sudah otomatis

### 7. Configure Email Templates (Optional)

1. Ke **Authentication** → **Email Templates**
2. Customize templates untuk:
   - **Confirm signup** - untuk verifikasi email
   - **Reset password** - untuk reset password
   - **Magic link** - untuk passwordless login

### 8. Test Connection

Jalankan dev server:
```bash
npm run dev
```

Cek browser console, seharusnya tidak ada error Supabase connection.

## 🗄️ Database Structure

### Tables:
- **categories** - Kategori buku (Fiction, Non-Fiction, dll)
- **products** - Data buku (title, author, price, stock, dll)
- **profiles** - User profile (extends auth.users)
- **addresses** - Shipping addresses untuk users
- **cart_items** - Shopping cart items
- **orders** - Order history
- **order_items** - Items dalam setiap order
- **reviews** - Product reviews

### Security:
- ✅ Row Level Security (RLS) enabled di semua tables
- ✅ Users hanya bisa access data mereka sendiri
- ✅ Products & Categories public read access
- ✅ Reviews public read, authenticated write

## 🔒 Row Level Security Policies

### Profiles
- Users can view/update their own profile only

### Cart Items
- Users can manage their own cart items only

### Orders
- Users can view/create their own orders only

### Addresses
- Users can CRUD their own addresses only

### Products & Categories
- Anyone can view (public access)
- Only admins can modify (via service role)

## 📊 Sample Queries

### Get all products with category:
```sql
SELECT p.*, c.name as category_name 
FROM products p
LEFT JOIN categories c ON p.category_id = c.id;
```

### Get user's cart with product details:
```sql
SELECT 
  ci.*,
  p.title,
  p.price,
  p.image,
  (ci.quantity * p.price) as subtotal
FROM cart_items ci
JOIN products p ON ci.product_id = p.id
WHERE ci.user_id = auth.uid();
```

### Get user's order history:
```sql
SELECT 
  o.*,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = auth.uid()
GROUP BY o.id
ORDER BY o.created_at DESC;
```

## 🎯 Next Steps

1. ✅ Setup Supabase project
2. ✅ Run schema.sql
3. ✅ (Optional) Run seed.sql
4. ✅ Update .env.local
5. 🔄 Implement Auth UI (SignIn, SignUp, etc)
6. 🔄 Connect Cart to Supabase
7. 🔄 Implement Checkout flow
8. 🔄 Fetch Products from Database

## 🆘 Troubleshooting

### Connection Error
- Pastikan NEXT_PUBLIC_SUPABASE_URL benar
- Pastikan NEXT_PUBLIC_SUPABASE_ANON_KEY valid
- Check Supabase project status (dashboard)

### RLS Policy Error
- User belum login (auth.uid() returns null)
- Policy belum dibuat atau salah
- Cek di **Authentication** → **Policies**

### Migration Error
- Pastikan run schema.sql dulu baru seed.sql
- Check error message di SQL Editor
- Mungkin ada constraint violation

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)
