import type { Metadata } from 'next';
import './globals.css';
import './progress-bar.css';
import ProgressBar from '@/components/ProgressBar';

export const metadata: Metadata = {
  title: 'Uchinaga Books - Toko Buku Premium Indonesia',
  description: 'Temukan koleksi buku pilihan dengan kualitas dan desain premium untuk para pecinta literatur',
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
