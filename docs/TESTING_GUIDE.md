# 🧪 Panduan Testing Authentication & Database Integration

## 📋 Prerequisites
- ✅ Next.js dev server running (`npm run dev`)
- ✅ Supabase project aktif
- ✅ Database schema sudah dijalankan
- ✅ Environment variables sudah diset

## 🔍 Test Scenarios

### Scenario 1: User Registration & Login Flow
**Objective**: Verify sign up, email verification, dan login process

1. **Sign Up**:
   - Buka http://localhost:3000/sign-up
   - Isi form:
     - Nama Depan: Leslie
     - Nama Belakang: Cooper
     - Email: test@example.com (gunakan email baru)
     - Telepon: 0812-3456-7890
     - Password: Test123456!
   - Klik "Buat Akun"
   - **Expected**: Redirect ke `/verify-code?email=test@example.com`

2. **Email Verification**:
   - Check email inbox untuk OTP code
   - Input kode verifikasi
   - **Expected**: Email terverifikasi, bisa login

3. **Sign In**:
   - Buka http://localhost:3000/sign-in
   - Login dengan email & password yang baru dibuat
   - **Expected**: 
     - Redirect ke homepage
     - Header menampilkan nama "Leslie" di dropdown
     - Cart icon menampilkan angka "0"

### Scenario 2: Add to Cart (Not Logged In)
**Objective**: Verify auth gate untuk add to cart

1. **Logout** (jika sedang login):
   - Klik dropdown user di header
   - Klik "Keluar"
   - **Expected**: Redirect ke homepage, header show "Masuk" button

2. **Try Add to Cart**:
   - Scroll ke "Rekomendasi Buku" section
   - Hover salah satu buku
   - Klik "Tambah ke Keranjang"
   - **Expected**: 
     - Redirect ke `/sign-in?redirect=/`
     - Pesan error tidak muncul

3. **Sign In & Redirect**:
   - Login dengan akun yang sudah ada
   - **Expected**: 
     - Redirect kembali ke homepage (dari `?redirect=/`)
     - Header show user name

### Scenario 3: Add to Cart (Logged In)
**Objective**: Verify cart functionality dengan database

1. **Add Item to Cart**:
   - Pastikan sudah login
   - Scroll ke "Rekomendasi Buku"
   - Hover buku dan klik "Tambah ke Keranjang"
   - **Expected**: 
     - Button berubah jadi "Menambahkan..." (loading state)
     - Alert: "Berhasil menambahkan ke keranjang!"
     - Cart count di header bertambah jadi "1"

2. **Add Same Item Again**:
   - Klik "Tambah ke Keranjang" lagi di buku yang sama
   - **Expected**: 
     - Cart count tetap "1" (quantity updated, bukan new item)

3. **Add Different Item**:
   - Klik "Tambah ke Keranjang" di buku lain
   - **Expected**: 
     - Cart count bertambah jadi "2"

### Scenario 4: Cart Management
**Objective**: Verify CRUD operations di cart page

1. **View Cart**:
   - Klik icon keranjang di header
   - **Expected**: 
     - Redirect ke `/cart`
     - Tampilan loading spinner sebentar
     - List semua items dengan:
       - Gambar buku
       - Nama buku
       - Kategori
       - Harga
       - Quantity controls
       - Subtotal

2. **Update Quantity**:
   - Klik tombol "+" pada item pertama
   - **Expected**: 
     - Quantity bertambah
     - Subtotal updated
     - Total updated
     - Buttons disabled sebentar (loading)

   - Klik tombol "-" 
   - **Expected**: 
     - Quantity berkurang
     - Subtotal & total updated

3. **Remove Item**:
   - Klik icon "X" di item
   - **Expected**: 
     - Item langsung hilang dari list
     - Cart count di header berkurang
     - Total updated

4. **Clear Cart**:
   - Klik "Kosongkan Keranjang"
   - **Expected**: 
     - Konfirmasi popup: "Apakah Anda yakin..."
     - Setelah konfirm: Semua items hilang
     - Tampilan empty state
     - Cart count di header jadi "0"

### Scenario 5: Profile Management
**Objective**: Verify profile data integration

1. **View Profile**:
   - Klik dropdown user di header
   - Klik "Akun Saya"
   - **Expected**: 
     - Redirect ke `/my-account`
     - Tab "Informasi Personal" aktif
     - Form terisi dengan data real:
       - Nama Depan: Leslie
       - Nama Belakang: Cooper
       - Email: test@example.com (disabled)
       - Telepon: 0812-3456-7890

2. **Update Profile**:
   - Edit "Nama Depan" jadi "John"
   - Edit "Telepon" jadi "0898-7654-3210"
   - Klik "Perbarui Perubahan"
   - **Expected**: 
     - Button jadi "Menyimpan..." (loading)
     - Alert: "Profil berhasil diperbarui!"
     - Nama di header dropdown update jadi "John"

3. **Test Persistence**:
   - Refresh page
   - **Expected**: 
     - Data tetap "John" dan nomor baru
     - Tidak reset ke data lama

### Scenario 6: Session Persistence
**Objective**: Verify auth state tetap setelah refresh

1. **Refresh Page** (masih login):
   - Tekan F5 atau Ctrl+R
   - **Expected**: 
     - Tetap login
     - Header tetap show user name
     - Cart count tetap

2. **Close & Reopen Browser**:
   - Close semua tab browser
   - Buka browser baru
   - Navigate ke http://localhost:3000
   - **Expected**: 
     - Tetap login (karena session tersimpan di cookies)
     - Header show user name

3. **Logout**:
   - Dropdown user → Keluar
   - **Expected**: 
     - Session cleared
     - Redirect ke homepage
     - Header show "Masuk" button

### Scenario 7: Protected Routes
**Objective**: Verify auth requirements untuk pages tertentu

1. **Access Cart (Not Logged In)**:
   - Logout dulu
   - Navigate ke http://localhost:3000/cart
   - **Expected**: 
     - Loading spinner sebentar
     - Auto redirect ke `/sign-in?redirect=/cart`

2. **Access My Account (Not Logged In)**:
   - Navigate ke http://localhost:3000/my-account
   - **Expected**: 
     - Loading spinner
     - Auto redirect ke `/sign-in?redirect=/my-account`

3. **Sign In & Auto Redirect**:
   - Login dari sign-in page
   - **Expected**: 
     - Auto redirect kembali ke `/cart` atau `/my-account`
     - Data langsung loaded

## 🐛 Common Issues & Solutions

### Issue 1: Cart count tidak update
**Symptom**: Setelah add to cart, angka di header tidak berubah

**Debug**:
1. Buka Developer Console (F12)
2. Check ada error atau tidak
3. Verify `cartUpdated` event ter-dispatch

**Fix**: 
- Pastikan `window.dispatchEvent(new Event('cartUpdated'))` dipanggil
- Check useEffect cleanup di Header

### Issue 2: "Session expired" error
**Symptom**: Tiba-tiba logout sendiri

**Debug**:
1. Check Supabase project masih aktif
2. Verify JWT expiration settings

**Fix**:
- Refresh session token di Supabase settings
- Implement token refresh di auth service

### Issue 3: Profile tidak load
**Symptom**: Form kosong di My Account page

**Debug**:
1. Console check error dari `profileService.getProfile()`
2. Verify RLS policies di Supabase

**Fix**:
- Check `profiles` table punya data untuk user
- Verify trigger `handle_new_user` berjalan saat sign up

## ✅ Success Criteria

Semua test scenarios harus PASS:
- [ ] Sign up → verify email → login berhasil
- [ ] Add to cart (not logged in) → redirect to sign-in
- [ ] Add to cart (logged in) → success + count update
- [ ] Update cart quantity → database sync
- [ ] Remove cart item → UI & database update
- [ ] Clear cart → all items removed
- [ ] View profile → real data displayed
- [ ] Update profile → data saved & persisted
- [ ] Logout → session cleared
- [ ] Protected routes → auto redirect to sign-in
- [ ] Session persistence → tetap login setelah refresh

## 📊 Database Verification

Untuk verify data benar-benar tersimpan, check di Supabase Dashboard:

1. **Profiles Table**:
   ```sql
   SELECT * FROM profiles WHERE email = 'test@example.com';
   ```
   Should show: first_name, last_name, phone

2. **Cart Items Table**:
   ```sql
   SELECT ci.*, p.title, p.price 
   FROM cart_items ci
   JOIN products p ON ci.product_id = p.id
   WHERE ci.user_id = '[user-uuid]';
   ```
   Should show: semua items di cart dengan details

3. **Auth Users**:
   - Navigate ke Authentication → Users
   - Should see email dengan status "Confirmed"

## 🎯 Performance Benchmarks

Target response times:
- ⚡ Load cart: < 500ms
- ⚡ Add to cart: < 300ms
- ⚡ Update profile: < 400ms
- ⚡ Sign in: < 600ms

Monitor di Network tab (F12 → Network):
- Filter by "Fetch/XHR"
- Check response times untuk Supabase API calls

## 🚨 Critical Tests

These MUST work for production:
1. ✅ Auth redirect tidak loop infinitely
2. ✅ Cart count akurat (tidak double count)
3. ✅ Profile update tidak overwrite data lain
4. ✅ Logout clear semua session data
5. ✅ RLS policies prevent unauthorized access

---

**Happy Testing!** 🧪✨

Jika ada issue, check:
1. Browser Console untuk error messages
2. Supabase Dashboard untuk data
3. Network tab untuk API responses
4. AUTH_INTEGRATION_COMPLETE.md untuk reference
