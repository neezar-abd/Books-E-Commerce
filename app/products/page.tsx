import AllProducts from '@/components/AllProducts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Semua Produk - Uchinaga Books',
  description: 'Jelajahi koleksi lengkap buku-buku berkualitas dari Uchinaga Books',
};

export default function ProductsPage() {
  return (
    <div className="min-h-screen font-sans text-primary bg-white">
      <Header />
      <main className="pt-6">
        <AllProducts />
      </main>
      <Footer />
    </div>
  );
}
