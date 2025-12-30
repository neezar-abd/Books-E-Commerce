import AllProducts from '@/components/AllProducts';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Semua Produk - Zaree',
  description: 'Jelajahi berbagai produk berkualitas dari Zaree Marketplace',
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
