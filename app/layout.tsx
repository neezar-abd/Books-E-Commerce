import type { Metadata } from 'next';
import './globals.css';
import './progress-bar.css';
import ProgressBar from '@/components/ProgressBar';

export const metadata: Metadata = {
  title: 'Zaree - Marketplace Online Terpercaya Indonesia',
  description: 'Temukan berbagai produk berkualitas dengan harga terbaik. Belanja mudah, aman, dan pengiriman cepat ke seluruh Indonesia',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
      </head>
      <body>
        <ProgressBar />
        {children}
      </body>
    </html>
  );
}
