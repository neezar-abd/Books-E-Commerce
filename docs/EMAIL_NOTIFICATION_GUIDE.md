# Email Notification Setup Guide

## Fitur Email Notification untuk Pesanan

Sistem email notification sudah disetup untuk mengirim email otomatis ke admin (penjual) dan customer setiap ada pesanan baru.

## Setup Gmail untuk Mengirim Email

### 1. Aktifkan 2-Factor Authentication (2FA) di Gmail

1. Buka [Google Account Security](https://myaccount.google.com/security)
2. Aktifkan "2-Step Verification"
3. Ikuti langkah-langkah verifikasi

### 2. Buat App Password

1. Setelah 2FA aktif, buka [App Passwords](https://myaccount.google.com/apppasswords)
2. Pilih "Mail" dan "Other (Custom name)"
3. Ketik "Lumina Books"
4. Klik "Generate"
5. Copy password 16 karakter yang muncul (contoh: `abcd efgh ijkl mnop`)

### 3. Update File .env.local

Edit file `.env.local` dan update nilai berikut:

```env
# Email Configuration
EMAIL_USER=emailkamu@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop

# Admin Email (email penjual)
ADMIN_EMAIL=emailadmin@gmail.com
```

**Penting:**
- `EMAIL_USER`: Email Gmail yang akan digunakan untuk mengirim email
- `EMAIL_PASSWORD`: App Password yang sudah di-generate (bukan password Gmail biasa!)
- `ADMIN_EMAIL`: Email tujuan untuk terima notifikasi pesanan (bisa sama dengan EMAIL_USER)

### 4. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

## Cara Kerja

1. **Customer Checkout**: Ketika customer selesai checkout dan create order
2. **Email ke Admin**: Otomatis kirim email notifikasi ke `ADMIN_EMAIL` dengan detail:
   - Nomor pesanan
   - Informasi customer (nama, email, telepon)
   - Alamat pengiriman lengkap
   - Detail produk yang dibeli
   - Total pembayaran
   - Button "Lihat Detail Pesanan" → ke admin dashboard
   
3. **Email ke Customer**: Otomatis kirim email konfirmasi ke customer dengan:
   - Konfirmasi pesanan berhasil
   - Detail lengkap pesanan
   - Button "Lacak Pesanan" → ke halaman my account

## Template Email

Email yang dikirim sudah include:
- ✅ Design modern dan responsive
- 📱 Mobile-friendly
- 🎨 Branding Lumina Books dengan gradient purple
- 📋 Detail lengkap pesanan
- 💰 Breakdown harga (subtotal, ongkir, pajak, diskon, total)
- 📦 Alamat pengiriman lengkap
- 🔔 Badge "PERLU SEGERA DIPROSES" untuk admin
- 🎉 Icon success untuk customer

## Alternative: Pakai SMTP Server Lain

Jika tidak ingin pakai Gmail, bisa pakai SMTP server lain. Edit file:
`app/api/email/send/route.ts`

```typescript
// Ganti dari:
service: 'gmail',

// Jadi (contoh untuk custom SMTP):
host: 'smtp.yourdomain.com',
port: 587,
secure: false,
```

## Troubleshooting

### Email tidak terkirim?

1. **Cek .env.local**: Pastikan EMAIL_USER dan EMAIL_PASSWORD sudah benar
2. **App Password**: Pastikan menggunakan App Password, bukan password Gmail biasa
3. **2FA Gmail**: Pastikan 2FA sudah aktif
4. **Restart Server**: Restart development server setelah update .env.local
5. **Cek Console**: Lihat error di terminal atau browser console

### Cek apakah email berhasil dikirim:

1. Buka browser console (F12)
2. Cek terminal server
3. Akan ada log "Failed to send email notification" jika ada error

### Email masuk ke Spam?

Ini normal untuk development. Untuk production:
- Setup domain email sendiri
- Pakai service seperti SendGrid, Mailgun, atau AWS SES
- Configure SPF, DKIM, dan DMARC records

## Production Recommendation

Untuk production, lebih baik pakai email service provider seperti:
- **Resend** (sudah terinstall di package.json)
- **SendGrid**
- **Mailgun**
- **AWS SES**

Service ini lebih reliable dan tidak masuk spam.

## Testing

Untuk test email notification:
1. Tambahkan beberapa produk ke cart
2. Checkout dan lengkapi form
3. Selesaikan pembayaran
4. Cek email admin dan customer
5. Email akan terkirim otomatis

---

**Note:** Email notification tidak akan mengganggu proses order. Jika email gagal terkirim, order tetap akan tersimpan di database.
