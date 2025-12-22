# Public Assets Folder

This folder contains static assets that are served from the root of your application.

## Current Files:
- `favicon.svg` - Site favicon (Lumina Books logo)

## How to Use:

Files in this directory are served from the root path `/`:

### Examples:
```
public/logo.png       → http://localhost:3000/logo.png
public/images/book.jpg → http://localhost:3000/images/book.jpg
public/fonts/font.woff → http://localhost:3000/fonts/font.woff
```

### In Components:
```tsx
// Using Next.js Image component
import Image from 'next/image';

<Image src="/logo.png" alt="Logo" width={200} height={100} />

// Or regular img tag
<img src="/logo.png" alt="Logo" />
```

### In CSS:
```css
.header {
  background-image: url('/images/background.jpg');
}
```

## Best Practices:

1. **Organize by Type**: Create subdirectories (images/, fonts/, icons/)
2. **Optimize Images**: Use WebP format when possible
3. **Use Next.js Image**: For automatic optimization
4. **Keep it Light**: Only essential static assets
5. **No Sensitive Data**: Never put API keys or secrets here

## Recommended Structure:
```
public/
├── favicon.svg
├── images/
│   ├── hero.jpg
│   └── products/
├── fonts/
│   └── custom-font.woff2
└── icons/
    └── app-icon.png
```
