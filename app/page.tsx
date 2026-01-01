import Header from '@/components/Header';
import Banner from '@/components/Banner';
import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import RecommendedProducts from '@/components/RecommendedProducts';
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
        <section id="recommended">
          <RecommendedProducts />
        </section>
      </main>
      <Footer />
    </div>
  );
}
