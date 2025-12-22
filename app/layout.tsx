import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lumina Books - Toko Buku Premium Indonesia',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
