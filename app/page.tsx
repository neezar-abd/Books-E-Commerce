import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Categories from '@/components/Categories';
import ProductSection from '@/components/ProductSection';
import ChatBot from '@/components/ChatBot';
import FlashSale from '@/components/FlashSale';
import DealsSection from '@/components/DealsSection';
import Testimonials from '@/components/Testimonials';
import BlogSection from '@/components/BlogSection';
import InstagramFeed from '@/components/InstagramFeed';
import FAQ from '@/components/FAQ';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen font-sans text-primary bg-white">
      <Header />
      <main>
        <section id="home">
          <Hero />
        </section>
        <section id="features">
          <Features />
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
        <section id="bestsellers">
          <DealsSection />
        </section>
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="blog">
          <BlogSection />
        </section>
        <section id="instagram">
          <InstagramFeed />
        </section>
        <section id="faq">
          <FAQ />
        </section>
        <section id="newsletter">
          <Newsletter />
        </section>
      </main>
      <ChatBot />
      <Footer />
    </div>
  );
}
