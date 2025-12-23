# ✅ Checklist Verifikasi - Migrasi Next.js

Gunakan checklist ini untuk memastikan semua fitur berfungsi dengan baik setelah migrasi.

## 🔧 Setup & Installation

- [x] Dependencies terinstall (`npm install`)
- [x] No installation errors
- [x] `.env.local` file created dengan GEMINI_API_KEY
- [x] Development server running (`npm run dev`)

## 🌐 Pages & Navigation

- [ ] Homepage loading di http://localhost:3000
- [ ] All sections terlihat:
  - [ ] Header dengan logo dan navigation
  - [ ] Hero section dengan CTA buttons
  - [ ] Features section
  - [ ] Categories section
  - [ ] Product Section dengan tabs
  - [ ] Flash Sale dengan countdown timer
  - [ ] Deals Section
  - [ ] Testimonials
  - [ ] Blog Section
  - [ ] Instagram Feed
  - [ ] FAQ dengan accordion
  - [ ] Newsletter signup
  - [ ] Footer dengan links

## 📱 Responsive Design

- [ ] Desktop view (1920px+)
- [ ] Laptop view (1366px)
- [ ] Tablet view (768px)
- [ ] Mobile view (375px)
- [ ] Mobile menu berfungsi di Header
- [ ] Semua sections responsive

## 🎨 Styling & Theming

- [ ] Tailwind CSS working
- [ ] Custom colors applied (primary: #20392B, secondary: #F5BE30)
- [ ] Custom fonts (Inter) loading
- [ ] Smooth animations
- [ ] Hover effects working
- [ ] Shadows dan borders correct

## 🤖 ChatBot Functionality

- [ ] ChatBot button terlihat di bottom-right
- [ ] Click button membuka chat window
- [ ] Chat window tampil dengan header
- [ ] Welcome message terlihat
- [ ] Input field working
- [ ] Send button working
- [ ] Press Enter untuk send message
- [ ] Gemini API response diterima
- [ ] Loading state (spinning icon) saat menunggu response
- [ ] Chat history tersimpan dalam session
- [ ] Close button berfungsi

### Test Prompts:
1. "Recommend me a fiction book"
2. "What genres do you have?"
3. "Tell me about your free shipping policy"

## 🛒 Interactive Features

- [ ] Product tabs switching (All Books, New Arrivals, etc.)
- [ ] FAQ accordion expand/collapse
- [ ] Flash Sale countdown timer counting down
- [ ] Hover effects pada product cards
- [ ] Heart/wishlist icons visible
- [ ] Shopping cart icons visible

## 🖼️ Images & Media

- [ ] Hero images loading
- [ ] Product images loading
- [ ] Blog post images loading
- [ ] Instagram feed images loading
- [ ] Testimonial avatars loading
- [ ] No broken images (check browser console)

## 🔍 Console & Errors

- [ ] No console errors di browser DevTools
- [ ] No 404 errors
- [ ] No TypeScript errors
- [ ] No missing module errors
- [ ] API calls successful (check Network tab)

## 🏗️ Build & Production

- [ ] `npm run build` berhasil tanpa errors
- [ ] No TypeScript compilation errors
- [ ] No build warnings (critical)
- [ ] Production build size reasonable
- [ ] `npm start` berjalan dengan baik

## 🚀 Performance

- [ ] Initial page load < 3 seconds
- [ ] Images loading progressively
- [ ] No layout shifts (CLS)
- [ ] Smooth scrolling
- [ ] Fast navigation between sections

## 🔐 Environment Variables

- [ ] GEMINI_API_KEY set di `.env.local`
- [ ] API key working (chatbot responding)
- [ ] No exposed secrets di client-side code
- [ ] Example file (`.env.local.example`) created

## 📝 Code Quality

- [ ] All components have proper TypeScript types
- [ ] No `any` types used excessively
- [ ] Imports using `@/` alias working
- [ ] 'use client' directive on appropriate components
- [ ] No unused imports
- [ ] Code formatted consistently

## 📚 Documentation

- [ ] README.md updated dengan Next.js info
- [ ] MIGRATION_COMPLETE.md created
- [ ] DEPLOYMENT.md created
- [ ] MIGRATION_NOTES.md created untuk cleanup guide

## 🧹 Cleanup (Optional - After Verification)

Setelah semua checklist di atas ✅, aman untuk menghapus file Vite lama:

- [ ] Backup project dulu
- [ ] Delete `index.html`
- [ ] Delete `index.tsx`
- [ ] Delete `App.tsx`
- [ ] Delete `vite.config.ts`
- [ ] Test lagi setelah delete

## 🎯 Final Verification

- [ ] Restart development server
- [ ] Clear browser cache
- [ ] Test di incognito/private window
- [ ] Test di browser lain (Chrome, Firefox, Safari)
- [ ] Test dari device lain (mobile phone)

---

## 📊 Status Summary

Total Checks: ~80

Completed: ______ / 80

Progress: _____%

---

## 🐛 Issues Found

Catat issues yang ditemukan di sini:

1. 
2. 
3. 

---

**Selamat! Jika semua checklist ✅, migrasi Anda sukses! 🎉**
