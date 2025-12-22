# 🚀 Quick Start - Admin Dashboard

Panduan cepat untuk setup dan menggunakan admin dashboard Lumina Books.

## ⚡ Setup Cepat (5 Menit)

### Step 1: Update Database
Jalankan SQL migration di Supabase:

```bash
# Buka Supabase Dashboard
# SQL Editor → New Query
# Copy paste isi file: supabase/schema.sql
# Run Query
```

### Step 2: Buat Admin User

**Opsi A - Via Website (Recommended)**
1. Sign up user baru di website: `/signup`
2. Buka Supabase Dashboard → Authentication → Users
3. Copy User ID
4. Buka SQL Editor, jalankan:
```sql
UPDATE profiles SET role = 'admin' WHERE id = 'PASTE-USER-ID-HERE';
```

**Opsi B - Via SQL Script**
```bash
# Edit file: supabase/create-admin.sql
# Ganti 'YOUR-USER-ID-HERE' dengan user ID
# Run di Supabase SQL Editor
```

### Step 3: Login & Akses
1. Login dengan user yang sudah dijadikan admin
2. Akses: `http://localhost:3000/admin/dashboard`
3. ✅ Done! Admin panel siap digunakan

## 📚 Halaman Admin

| URL | Fungsi |
|-----|--------|
| `/admin/dashboard` | Overview & statistik |
| `/admin/orders` | Kelola pesanan |
| `/admin/products` | Kelola produk |
| `/admin/users` | Kelola user |
| `/admin/content` | Kelola konten website |
| `/admin/settings` | Pengaturan toko |

## 🎯 Fitur Utama

### 1️⃣ Dashboard
- Lihat total orders, revenue, users, products
- Monitor pending orders
- Check low stock products
- View recent orders

### 2️⃣ Order Management
✅ Update status pesanan:
- Pending → Processing → Shipped → Delivered
- Atau: Cancelled

✅ Update payment status:
- Pending → Paid
- Atau: Failed

✅ Tambah tracking number untuk pengiriman

### 3️⃣ Product Management
✅ Tambah produk baru:
- Upload gambar
- Set harga & stock
- Pilih kategori
- Set featured/bestseller

✅ Edit & hapus produk
✅ Search & filter produk
✅ Monitor low stock

### 4️⃣ User Management
✅ Lihat semua user registered
✅ Promote user ke admin
✅ Demote admin ke user
✅ Search user by name/phone

### 5️⃣ Content Management
✅ Edit hero section
✅ Manage flash sale
✅ Update deals section
✅ Control promotional banners

### 6️⃣ Settings
✅ General settings (site info)
✅ Shipping settings
✅ Payment methods
✅ Store configuration

## 🔑 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Global search |
| `Esc` | Close modal |
| `Ctrl + S` | Save changes |

## 💡 Tips & Tricks

### Cara Update Order Status
1. Buka `/admin/orders`
2. Klik icon Edit (pensil) pada order
3. Pilih status baru
4. Klik "Save Changes"

### Cara Tambah Produk
1. Buka `/admin/products`
2. Klik "Add Product"
3. Isi semua field (minimal: title, author, price, stock)
4. Klik "Create Product"

### Cara Jadikan User Admin
1. Buka `/admin/users`
2. Cari user yang ingin dijadikan admin
3. Ubah role dropdown dari "User" ke "Admin"
4. Otomatis tersimpan!

### Cara Update Hero Banner
1. Buka `/admin/content`
2. Tab "Hero Section"
3. Edit title, subtitle, image URL, CTA
4. Klik "Save Changes"

## ⚠️ Important Notes

### Security
- ⚠️ **JANGAN** share credentials admin
- ✅ Selalu logout setelah selesai
- ✅ Gunakan password yang kuat
- ✅ Backup database secara rutin

### Best Practices
- ✅ Test di development sebelum production
- ✅ Double check sebelum delete product/user
- ✅ Regular backup data
- ✅ Monitor admin activity

### Common Issues

**Q: Tidak bisa akses admin panel?**
A: Cek role di database, pastikan = 'admin'

**Q: Data tidak muncul?**
A: Cek Supabase connection, verify RLS policies

**Q: Error saat save?**
A: Check console browser, lihat error message

## 📞 Need Help?

1. Baca [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md) untuk dokumentasi lengkap
2. Check console browser untuk error details
3. Verify Supabase connection & RLS policies

## ✅ Checklist First Time Setup

- [ ] Run database migration (schema.sql)
- [ ] Create admin user (set role = 'admin')
- [ ] Test login dengan admin user
- [ ] Akses /admin/dashboard successfully
- [ ] Test create/edit/delete product
- [ ] Test update order status
- [ ] Test all admin pages
- [ ] Verify security (non-admin cannot access)

---

**🎉 Selamat! Admin dashboard sudah siap digunakan!**

Untuk dokumentasi lengkap, baca: [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md)
