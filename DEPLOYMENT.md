# 🚀 Deployment Guide - Lumina Books

## Deploy ke Vercel (Recommended)

Next.js dikembangkan oleh Vercel, jadi deployment ke Vercel adalah yang paling mudah dan optimal.

### Langkah-langkah:

1. **Push ke GitHub**
   ```bash
   git init
   git add .
   git commit -m "Migrate to Next.js 15"
   git branch -M main
   git remote add origin your-github-repo-url
   git push -u origin main
   ```

2. **Deploy di Vercel**
   - Buka [vercel.com](https://vercel.com)
   - Login dengan GitHub
   - Click "New Project"
   - Import repository Anda
   - Vercel akan auto-detect Next.js

3. **Setup Environment Variables**
   Di Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `your_api_key`
   - Save

4. **Deploy!**
   - Click "Deploy"
   - Done! Your app will be live in minutes

### Auto-Deploy

Setiap push ke branch `main` akan otomatis deploy ke production!

## Deploy ke Platform Lain

### Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login:
   ```bash
   netlify login
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Docker

1. Buat `Dockerfile`:
   ```dockerfile
   FROM node:18-alpine AS base
   
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   ENV NEXT_TELEMETRY_DISABLED 1
   RUN npm run build
   
   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   EXPOSE 3000
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. Build dan run:
   ```bash
   docker build -t lumina-books .
   docker run -p 3000:3000 -e GEMINI_API_KEY=your_key lumina-books
   ```

### Static Export (SSG)

Untuk hosting di static host seperti GitHub Pages:

1. Update `next.config.mjs`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true,
     },
   };
   
   export default nextConfig;
   ```

2. Build:
   ```bash
   npm run build
   ```

3. Upload folder `out/` ke static host

## Environment Variables

Pastikan set environment variables di platform deployment:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

## Performance Tips

1. **Enable Image Optimization**
   - Sudah dikonfigurasi untuk Unsplash
   - Menggunakan Next.js Image component untuk optimasi otomatis

2. **Enable Analytics**
   - Tambahkan Vercel Analytics (gratis)
   - Monitoring performa aplikasi

3. **Caching**
   - Next.js auto-cache static pages
   - API routes bisa dikonfigurasi caching

## Domain Custom

### Di Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records sesuai instruksi
4. SSL certificate auto-generated

## Monitoring

### Vercel Analytics
```bash
npm install @vercel/analytics
```

Di `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Troubleshooting

### Build Error
- Check `npm run build` locally first
- Ensure all dependencies installed
- Check environment variables set

### Image Not Loading
- Verify image URLs in `next.config.mjs`
- Check network tab di browser console

### API Key Error
- Verify `GEMINI_API_KEY` set correctly
- Check API key valid di Google AI Studio

---

**Happy Deploying! 🚀**
