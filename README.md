<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Lumina Books - Next.js App

This is a modern bookstore application built with Next.js 16, React 19, TypeScript, and Tailwind CSS. It features an AI-powered chatbot using Google's Gemini API.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Typography:** Satoshi (via Fontshare)
- **Icons:** Lucide React
- **AI:** Google Gemini API

## Features

### Customer Features
- 📚 Modern bookstore interface with curated collections
- 🤖 AI-powered chatbot for book recommendations
- 🛒 Shopping cart & checkout system
- 👤 User authentication & profiles
- 📦 Order tracking
- 🎨 Minimalist design with premium aesthetics
- 📱 Fully responsive layout
- ⚡ Fast and optimized with Next.js

### Admin Features (NEW!)
- 📊 **Admin Dashboard** - Comprehensive admin panel untuk mengelola toko
- 📈 Real-time statistics & analytics
- 📦 Order management (update status, tracking number, payment)
- 📚 Product management (CRUD, stock, pricing)
- 👥 User management (role management, user list)
- 📝 Content management (hero, flash sale, deals)
- ⚙️ Settings (shipping, payment methods, store config)

👉 **[Admin Dashboard Documentation](./ADMIN_DASHBOARD.md)**  
👉 **[Quick Start Guide](./ADMIN_QUICKSTART.md)**

## Getting Started

**Prerequisites:** Node.js 18+ and npm

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Create a `.env.local` file in the root directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   
   You can get your Gemini API key from [Google AI Studio](https://ai.google.dev/)

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Admin Panel Setup

Dashboard admin untuk mengelola seluruh aspek toko online.

### Quick Setup (5 menit):

1. **Update Database:**
   ```bash
   # Buka Supabase Dashboard → SQL Editor
   # Run: supabase/schema.sql
   ```

2. **Create Admin User:**
   ```sql
   -- Sign up user baru via website terlebih dahulu
   -- Kemudian jalankan di Supabase SQL Editor:
   UPDATE profiles SET role = 'admin' WHERE id = 'YOUR-USER-ID';
   ```

3. **Access Admin Panel:**
   - Login dengan admin user
   - Navigate to: `http://localhost:3000/admin/dashboard`

📚 **Full Documentation:** [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md)  
⚡ **Quick Start:** [ADMIN_QUICKSTART.md](./ADMIN_QUICKSTART.md)

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Home page
│   ├── globals.css          # Global styles
│   ├── admin/               # Admin panel pages
│   │   ├── dashboard/       # Dashboard overview
│   │   ├── orders/          # Order management
│   │   ├── products/        # Product management
│   │   ├── users/           # User management
│   │   ├── content/         # Content management
│   │   └── settings/        # Settings
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout process
│   ├── my-account/          # User account
│   ├── product/[id]/        # Product detail
│   ├── sign-in/             # Sign in page
│   └── signup/              # Sign up page
├── components/              # React components
│   ├── AdminLayout.tsx      # Admin layout wrapper
│   ├── AdminSidebar.tsx     # Admin sidebar navigation
│   └── ...                  # Other components
├── lib/
│   ├── admin.ts            # Admin functions & API
│   ├── auth.ts             # Authentication
│   ├── cart.ts             # Cart operations
│   ├── orders.ts           # Order operations
│   ├── products.ts         # Product operations
│   ├── supabase.ts         # Supabase client
│   └── utils.ts            # Utility functions
├── supabase/
│   ├── schema.sql          # Database schema
│   ├── seed.sql            # Sample data
│   └── create-admin.sql    # Admin user setup
├── public/                  # Static assets
├── constants.ts            # App constants
├── types.ts                # TypeScript types
└── next.config.mjs         # Next.js config
```

## License

This project is private and proprietary.
