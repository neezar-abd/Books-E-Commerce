# Admin Dashboard - Lumina Books

Dashboard admin lengkap untuk mengelola toko buku online Lumina Books.

## 🎯 Fitur Utama

### 1. **Dashboard Overview** (`/admin/dashboard`)
- Statistik real-time (total orders, revenue, users, products)
- Grafik performa toko
- Daftar pesanan terbaru
- Notifikasi low stock products
- Quick access ke semua fitur

### 2. **Order Management** (`/admin/orders`)
- Lihat semua pesanan dengan filter (status, payment, search)
- Update status pesanan (pending, processing, shipped, delivered, cancelled)
- Update payment status (pending, paid, failed)
- Tambah/update tracking number
- Detail lengkap setiap pesanan
- Export data pesanan

### 3. **Product Management** (`/admin/products`)
- CRUD produk lengkap (Create, Read, Update, Delete)
- Upload gambar produk
- Kelola kategori produk
- Set featured & bestseller products
- Manage stock & pricing
- Bulk operations
- Product search & filter

### 4. **User Management** (`/admin/users`)
- Lihat semua user registered
- Update user role (user/admin)
- View user details & activity
- User search & filter
- Export user data

### 5. **Content Management** (`/admin/content`)
- Edit Hero Section (title, subtitle, CTA, background)
- Manage Flash Sale (enable/disable, discount, end date)
- Update Deals Section
- Manage promotional banners
- Update website content

### 6. **Settings** (`/admin/settings`)
- General settings (site name, contact info)
- Shipping settings (free shipping threshold, flat rate)
- Payment methods (COD, Bank Transfer, E-Wallet)
- Email & notification settings

## 🔐 Security & Authentication

### Database Security (RLS Policies)
```sql
-- Admin memiliki akses penuh ke:
- Semua orders (read, update)
- Semua products (create, read, update, delete)
- Semua users/profiles (read)
- Categories (full CRUD)
```

### Frontend Security
- Protected routes dengan `AdminLayout` component
- Automatic redirect jika bukan admin
- Token-based authentication via Supabase
- Role-based access control

## 📁 Struktur File

```
app/admin/
├── dashboard/
│   └── page.tsx          # Overview & statistics
├── orders/
│   └── page.tsx          # Order management
├── products/
│   └── page.tsx          # Product management
├── users/
│   └── page.tsx          # User management
├── content/
│   └── page.tsx          # Content management
└── settings/
    └── page.tsx          # Settings

components/
├── AdminLayout.tsx       # Layout wrapper dengan auth check
└── AdminSidebar.tsx      # Sidebar navigation

lib/
└── admin.ts             # Admin functions & API calls
```

## 🚀 Setup & Installation

### 1. Update Database Schema
Jalankan migration untuk menambahkan role admin:

```sql
-- Sudah ada di supabase/schema.sql
-- Role field sudah ditambahkan di profiles table
-- RLS policies untuk admin sudah dikonfigurasi
```

### 2. Buat Admin User
Ada 2 cara untuk membuat admin:

**Cara 1: Via Supabase Dashboard**
1. Buka Supabase Dashboard
2. Masuk ke Table Editor → profiles
3. Edit user yang ingin dijadikan admin
4. Set field `role` = `admin`

**Cara 2: Via SQL**
```sql
-- Replace 'user-id-here' dengan ID user yang ingin dijadikan admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-id-here';
```

### 3. Akses Admin Panel
1. Login sebagai user dengan role admin
2. Akses `/admin/dashboard`
3. Jika bukan admin, akan otomatis redirect ke login

## 🎨 Design System

### Colors
- **Primary**: Blue (#2563EB)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Gray Scale**: Tailwind gray palette

### Components
- Modern card-based layout
- Responsive design (mobile-first)
- Smooth animations (Framer Motion)
- Consistent spacing & typography
- Lucide Icons

## 📊 API Functions

### Dashboard Stats
```typescript
getDashboardStats()
// Returns: totalOrders, pendingOrders, totalRevenue, 
//          totalUsers, totalProducts, lowStockProducts
```

### Orders
```typescript
getAllOrders(filters?)      // Get all orders dengan filter
updateOrderStatus(id, status)
updatePaymentStatus(id, status)
updateTrackingNumber(id, number)
```

### Products
```typescript
getAllProducts()            // Get all products
createProduct(data)         // Create new product
updateProduct(id, data)     // Update product
deleteProduct(id)           // Delete product
```

### Users
```typescript
getAllUsers()               // Get all users
updateUserRole(id, role)    // Update user role
```

## 🔧 Customization

### Menambah Menu Baru
Edit `components/AdminSidebar.tsx`:

```typescript
const menuItems = [
  // ... existing items
  { icon: YourIcon, label: 'New Menu', href: '/admin/new-menu' },
];
```

### Menambah Stats Card
Edit `app/admin/dashboard/page.tsx`:

```typescript
const statCards = [
  // ... existing cards
  {
    icon: YourIcon,
    label: 'Your Metric',
    value: stats?.yourValue || 0,
    color: 'from-color-500 to-color-600',
    // ...
  },
];
```

## 🐛 Troubleshooting

### User tidak bisa akses admin panel
1. Cek role di database: `SELECT role FROM profiles WHERE id = 'user-id'`
2. Pastikan role = `admin`
3. Clear browser cache dan login ulang

### RLS Policy Error
1. Pastikan RLS policies sudah di-apply
2. Cek admin policies di Supabase Dashboard
3. Re-run schema.sql jika perlu

### Data tidak muncul
1. Cek console browser untuk error
2. Pastikan Supabase connection aktif
3. Verify RLS policies tidak memblokir akses

## 📝 Best Practices

1. **Selalu backup database** sebelum import data baru
2. **Test di development** sebelum deploy ke production
3. **Monitor admin activity** untuk security
4. **Regular backup** untuk data penting
5. **Update dependencies** secara berkala

## 🎯 Roadmap / Future Features

- [ ] Advanced analytics & reports
- [ ] Bulk import/export products (CSV/Excel)
- [ ] Email notifications untuk admin
- [ ] Activity logs & audit trail
- [ ] Sales analytics & charts
- [ ] Inventory management
- [ ] Supplier management
- [ ] Marketing tools (coupons, discounts)
- [ ] Customer segmentation
- [ ] Advanced search & filters

## 📞 Support

Jika ada pertanyaan atau issue:
1. Check dokumentasi ini terlebih dahulu
2. Cek file-file di `/app/admin/` untuk referensi
3. Review `lib/admin.ts` untuk API functions

## ✅ Checklist Deployment

- [ ] Update database schema (run migration)
- [ ] Set admin user (update role di database)
- [ ] Test semua fitur admin panel
- [ ] Verify RLS policies aktif
- [ ] Test authentication & authorization
- [ ] Check responsive design
- [ ] Test all CRUD operations
- [ ] Verify error handling
- [ ] Setup monitoring/logging
- [ ] Backup database

---

**Version:** 1.0.0  
**Last Updated:** December 2025  
**Built with:** Next.js 14, TypeScript, Supabase, Tailwind CSS, Framer Motion
