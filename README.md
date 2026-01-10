# 🛍️ Zaree Marketplace

> Modern e-commerce platform with Indonesian location-based filtering, built with Next.js and Supabase

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [Key Features](#-key-features)
- [Deployment](#-deployment)

---

## ✨ Features

### 🛒 Core E-commerce
- **Product Management** - Full CRUD with variants, images, and specifications
- **Shopping Cart** - Real-time cart with quantity management
- **Checkout System** - Multi-step checkout with payment integration
- **Order Tracking** - Real-time order status updates
- **Product Search** - Advanced search with filters

### 📍 Location-Based System
- **34 Provinces** - Complete Indonesian provinces
- **489 Cities** - All Indonesian cities/regencies
- **Location Filter** - Filter products by seller location
- **Cascading Dropdowns** - Province → City selection
- **Location Badges** - Display seller location on products

### 👥 User Features
- **Authentication** - Email/password with email verification
- **User Profiles** - Complete profile management
- **Order History** - View all past orders
- **Wishlist** - Save favorite products
- **Reviews & Ratings** - Product review system

### 🏪 Seller Dashboard
- **Store Management** - Store profile, logo, banner
- **Product Management** - Add/edit products with variants
- **Order Management** - Process customer orders
- **Shipping Options** - Configure shipping zones and rates
- **Analytics** - Sales statistics and insights

### 👨‍💼 Admin Panel
- **User Management** - View/manage all users
- **Product Moderation** - Approve/reject products
- **Order Overview** - Monitor all orders
- **Content Management** - Manage categories, brands
- **Analytics Dashboard** - Business insights with charts

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 16.1](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[React Hook Form](https://react-hook-form.com/)** - Form validation

### Backend
- **[Supabase](https://supabase.com/)** - Backend as a Service
  - **PostgreSQL** - Relational database
  - **Row Level Security (RLS)** - Database security
  - **Storage** - File uploads (images, documents)
  - **Auth** - User authentication
  - **Realtime** - Real-time subscriptions (optional)

### Development
- **[Turbopack](https://turbo.build/)** - Fast bundler (Next.js 16)
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** or **pnpm** (comes with Node.js)
- **Supabase Account** ([Sign up free](https://supabase.com/))
- **Git** ([Download](https://git-scm.com/))

---

## 🚀 Installation

### 1. Clone Repository

```bash
git clone https://github.com/your-username/zaree-marketplace.git
cd zaree-marketplace
```

### 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 3. Environment Setup

Create `.env.local` file in root:

```bash
cp .env.example .env.local
```

---

## 🔐 Environment Variables

Add these to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# App Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Zaree

# Email (Supabase handles this)
# Optional: SMTP settings if using custom email
```

### Getting Supabase Keys:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep secret!)

---

## 🗄️ Database Setup

### 1. Run SQL Migrations

Execute migrations in order from `supabase/migrations/`:

```sql
-- 1. Core tables
add_categories_table.sql
add_brands_system.sql

-- 2. Location system
add_location_tables.sql
update_stores_products_location.sql

-- 3. Product features
add_product_variants_and_shipping.sql

-- 4. Optimization
database_optimization.sql
```

**How to run:**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy SQL content from each file
3. Execute in order

### 2. Import Data

Run scripts to import data:

```bash
# Import categories
node scripts/sync-categories.js

# Import location data (34 provinces, 489 cities)
node scripts/import-locations.js

# Import brands (optional)
node scripts/import-brands.js
```

### 3. Verify Database

Check tables created:
- `profiles` - User profiles
- `categories` - Product categories
- `provinces` - Indonesian provinces (34)
- `cities` - Indonesian cities (489)
- `stores` - Seller stores
- `products` - Products catalog
- `product_variants` - Product variants
- `orders` - Customer orders
- `order_items` - Order details
- `shipping_zones` - Shipping configuration

---

## 🏃 Running the Project

### Development Mode

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

---

## 📁 Project Structure

```
zaree-marketplace/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (sign-in, sign-up)
│   ├── [slug]/              # Dynamic category pages
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes
│   ├── cart/                # Shopping cart
│   ├── checkout/            # Checkout flow
│   ├── my-account/          # User account
│   ├── product/             # Product detail
│   ├── search/              # Search results
│   ├── seller/              # Seller dashboard
│   └── store/               # Public store pages
│
├── components/              # React components
│   ├── LocationSelector.tsx # Province/city picker
│   ├── LocationFilter.tsx   # Location filter UI
│   ├── LocationBadge.tsx    # Location display
│   ├── ProductCard.tsx      # Product card
│   ├── Header.tsx           # Navbar
│   ├── Footer.tsx           # Footer
│   └── ...
│
├── lib/                     # Utility libraries
│   ├── supabase.ts         # Supabase client
│   ├── auth.ts             # Auth helpers
│   ├── cart.ts             # Cart service
│   └── shipping.ts         # Shipping logic
│
├── supabase/
│   ├── migrations/         # SQL migrations
│   └── seeds/              # Seed data (optional)
│
├── scripts/                # Data import scripts
│   ├── import-locations.js # Import provinces/cities
│   ├── sync-categories.js  # Import categories
│   └── import-brands.js    # Import brands
│
├── public/                 # Static assets
│   ├── gambar/            # Product images
│   └── fonts/             # Custom fonts
│
└── .env.local             # Environment variables (create this)
```

---

## 🎯 Key Features

### 📍 Indonesian Location System

Complete location filtering with **34 provinces** and **489 cities**:

```typescript
// Usage Example
<LocationSelector
  value={location}
  onChange={(loc) => {
    setLocation(loc);
    // loc = { provinceId, provinceName, cityId, cityName }
  }}
  required
/>
```

**API Endpoints:**
- `GET /api/locations/provinces` - All provinces
- `GET /api/locations/cities?province_id=xxx` - Cities by province

### 🛒 Shopping Cart

Real-time cart with localStorage persistence:

```typescript
import { cartService } from '@/lib/cart';

// Add to cart
cartService.addItem(product, quantity);

// Get cart
const items = cartService.getCartItems();

// Clear cart
cartService.clearCart();
```

### 🔐 Authentication

Email/password with verification:

```typescript
import { authService } from '@/lib/auth';

// Sign up
await authService.signUp(email, password, fullName);

// Sign in
await authService.signIn(email, password);

// Get user
const user = await authService.getUser();
```

### 📦 Product Variants

Support for sizes, colors, stock per variant:

```typescript
// Product with variants
{
  title: "T-Shirt",
  variants: [
    { size: "M", color: "Red", stock: 10, price: 99000 },
    { size: "L", color: "Blue", stock: 5, price: 99000 }
  ]
}
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

- Connect GitHub repository
- Add environment variables
- Deploy!

3. **Environment Variables on Vercel**

Add all `.env.local` variables in Vercel dashboard:
- Settings → Environment Variables
- Add each variable
- Redeploy

### Other Platforms

- **Netlify** - Similar to Vercel
- **Railway** - Full-stack deployment
- **AWS Amplify** - AWS hosting
- **DigitalOcean App Platform** - VPS alternative

---

## 📊 Database Schema Overview

### Core Tables

```sql
-- Users & Auth (handled by Supabase Auth)
profiles (id, email, full_name, role, ...)

-- Products
categories (id, name, slug, image)
brands (id, name, logo)
products (id, title, price, category_id, store_id, ...)
product_variants (id, product_id, size, color, stock, ...)

-- Location
provinces (id, name, slug, zone)
cities (id, province_id, name, type)

-- Stores
stores (id, owner_id, name, province_id, city_id, ...)

-- Orders
orders (id, user_id, total_amount, status, ...)
order_items (id, order_id, product_id, quantity, price)

-- Shipping
shipping_zones (id, name, provinces, base_rate)
```

---

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** - Database-level security
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **API Route Protection** - Middleware guards
- ✅ **Input Validation** - Client & server-side
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **XSS Protection** - React auto-escaping

---

## 📝 Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Database
node scripts/sync-categories.js      # Import categories
node scripts/import-locations.js     # Import locations
node scripts/import-brands.js        # Import brands
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run dev
```

### Database Connection Issues

- Check `.env.local` has correct Supabase URL
- Verify API keys are valid
- Ensure RLS policies are set correctly

### Import Scripts Fail

- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify network connection
- Run migrations first before importing data

---

## 📞 Support

- 📧 Email: support@zaree.id
- 💬 GitHub Issues: [Create an issue](https://github.com/your-username/zaree-marketplace/issues)
- 📖 Documentation: [Wiki](https://github.com/your-username/zaree-marketplace/wiki)

---

## 🎉 Acknowledgments

- **Supabase** - Backend infrastructure
- **Next.js Team** - Amazing React framework
- **Vercel** - Hosting platform
- **TailwindCSS** - Styling system

---

**Made with ❤️ in Indonesia** 🇮🇩
