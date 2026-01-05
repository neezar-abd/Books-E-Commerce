# Sistem Kategori dan Subkategori Dinamis

## 📋 Fitur yang Sudah Diimplementasi

### 1. **API Endpoint Kategori** (`/api/categories`)
File: `app/api/categories/route.ts`

API endpoint yang dapat:
- Mengambil semua kategori utama
- Mengambil subkategori level 1 berdasarkan kategori
- Mengambil subkategori level 2 berdasarkan kategori dan subkategori 1

**Cara Penggunaan:**
```typescript
// Semua kategori
GET /api/categories

// Subkategori level 1 dari "Pakaian Pria"
GET /api/categories?kategori=Pakaian%20Pria

// Subkategori level 2
GET /api/categories?kategori=Pakaian%20Pria&subkategori1=Celana%20Panjang%20Jeans
```

### 2. **Halaman Kategori Dinamis**
File: `app/category/[slug]/page.tsx`

Halaman yang menampilkan:
- Breadcrumb navigasi (Beranda > Kategori > Subkategori)
- Grid subkategori dengan gambar
- Filter subkategori di sidebar
- Produk yang terfilter berdasarkan kategori/subkategori

**URL Format:**
```
/category/Pakaian%20Pria
/category/Pakaian%20Pria?sub1=Hoodie%20%26%20Sweatshirt
/category/Pakaian%20Pria?sub1=Hoodie&sub2=Hoodie
```

### 3. **Komponen AllProducts dengan Filter Subkategori**
File: `components/AllProducts.tsx`

Fitur baru:
- Filter subkategori yang muncul ketika kategori dipilih
- Checkbox untuk memilih multiple subkategori
- Auto-load subkategori berdasarkan kategori yang dipilih
- Reset filter untuk subkategori

### 4. **Helper Functions**
File: `lib/categories-helper.ts`

Utility functions:
- `getAllCategories()` - Ambil semua kategori utama
- `getSubcategoriesLevel1(kategori)` - Ambil subkategori level 1
- `getSubcategoriesLevel2(kategori, subkat1)` - Ambil subkategori level 2
- `getSubcategoriesLevel3(kategori, subkat1, subkat2)` - Ambil subkategori level 3
- `getCategoryById(id)` - Ambil data kategori by ID
- `searchCategories(keyword)` - Cari kategori by keyword
- `getCategoryHierarchy(id)` - Ambil hierarchy breadcrumb

## 🎯 Cara Kerja

### Skenario 1: User klik "Pakaian Pria"
1. User mengklik kategori "Pakaian Pria" di halaman produk
2. Sidebar menampilkan checkbox subkategori seperti:
   - Celana Panjang Jeans
   - Hoodie & Sweatshirt
   - Sweater & Kardigan
   - Jaket, Mantel, & Rompi
   - dll.
3. User bisa checklist subkategori yang diinginkan
4. Produk akan terfilter sesuai subkategori yang dipilih

### Skenario 2: User akses halaman kategori langsung
1. User navigasi ke `/category/Pakaian%20Pria`
2. Halaman menampilkan grid subkategori dengan gambar
3. User klik salah satu subkategori
4. URL berubah menjadi `/category/Pakaian%20Pria?sub1=Hoodie%20%26%20Sweatshirt`
5. Halaman menampilkan subkategori level 2 (jika ada) atau produk

### Skenario 3: Filter di halaman All Products
1. User pilih kategori "Pakaian Pria" via radio button
2. Sidebar otomatis menampilkan subkategori yang relevan
3. User checklist subkategori yang diinginkan (bisa multiple)
4. Produk langsung terfilter berdasarkan pilihan

## 🔧 Cara Mengintegrasikan dengan Database Produk

Saat ini implementasi sudah siap, namun perlu menghubungkan dengan skema database produk Anda. Update bagian berikut:

### Di `app/category/[slug]/page.tsx`:
```typescript
// Line ~70-80, ganti dengan query sesuai skema produk Anda
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', categoryName) // Sesuaikan field name
  .eq('subcategory1', subkategori1) // Jika ada
  .eq('is_active', true);
```

### Di `components/AllProducts.tsx`:
```typescript
// Tambahkan filter untuk subcategory di function applyFilters()
// Sekitar line ~100-110, tambahkan:
if (selectedSubcategories.length > 0) {
  filtered = filtered.filter(product => 
    selectedSubcategories.includes(product.subcategory1) ||
    selectedSubcategories.includes(product.subcategory2)
  );
}
```

## 📝 Next Steps

1. **Sesuaikan skema database produk** dengan field kategori/subkategori
2. **Tambahkan link** di halaman utama/menu ke halaman kategori
3. **Styling lebih lanjut** sesuai design Anda
4. **Testing** dengan data kategori yang berbeda

## 🎨 Contoh Penggunaan di Komponen Lain

```typescript
import { getAllCategories, getSubcategoriesLevel1 } from '@/lib/categories-helper';

// Di menu navigasi
const categories = getAllCategories();
categories.forEach(cat => {
  console.log(cat.name, cat.image);
});

// Saat user hover kategori
const subcats = getSubcategoriesLevel1('Pakaian Pria');
// Tampilkan dropdown dengan subcats
```

## ✅ Struktur Data

Data kategori sudah tersedia di `data-kategori-jadi.json` dengan struktur:
```json
{
  "kategori": "Pakaian Pria",
  "kategori-1": "Hoodie & Sweatshirt", 
  "kategori-2": "Hoodie",
  "kategori-3": "-",
  "kategori-4": "-",
  "id kategori": 100226,
  "gbr-1": "https://...",
  ...
}
```

Sistem sudah siap menangani hierarki hingga 4 level subkategori!
