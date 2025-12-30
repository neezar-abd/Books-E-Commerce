import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import FlashSale from '@/components/FlashSale';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-primary bg-surface">
      <Header />
      <main>
        <section id="banner">
          <Banner />
        </section>
        <section id="categories">
          <Categories />
        </section>
        <section id="products">
          <ProductSection />
        </section>
        <section id="flash-sale">
          <FlashSale />
        </section>
      </main>
      <Footer />
    </div>
  );
}
