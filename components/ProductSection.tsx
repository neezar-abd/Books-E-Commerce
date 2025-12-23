'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';
import { cartService } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

const ProductSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Semua Buku');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['Semua Buku', 'Terbaru', 'Terlaris', 'Pilihan Kritikus'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(4);

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Heading */}
        <FadeIn delay={0.1}>
          <div className="text-center mb-12">
             <span className="text-secondary font-medium uppercase tracking-wide">Koleksi Kami</span>
             <h2 className="text-3xl md:text-4xl font-bold text-primary mt-2">Karya Sastra Pilihan</h2>
          </div>
        </FadeIn>

        {/* Tabs */}
        <StaggerContainer staggerDelay={0.1}>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {tabs.map(tab => (
              <motion.button
                key={tab}
                variants={staggerItem}
                onClick={() => setActiveTab(tab)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-2 rounded-full text-sm font-semibold border transition-all ${
                  activeTab === tab 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </StaggerContainer>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : (
          <>
            <StaggerContainer staggerDelay={0.1}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                 {products.map(product => (
                   <motion.div key={product.id} variants={staggerItem}>
                     <ProductCard product={product} />
                   </motion.div>
                 ))}
              </div>
            </StaggerContainer>

            {/* View All Button */}
            <FadeIn delay={0.3}>
              <div className="text-center mt-12">
                <Link 
                  href="/products" 
                  className="inline-block px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all font-semibold text-sm"
                >
                  Lihat Semua Produk →
                </Link>
              </div>
            </FadeIn>
          </>
        )}
      </div>
    </section>
  );
};

const ProductCard: React.FC<{ product: any }> = ({ product }) => {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setAdding(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in?redirect=/');
        return;
      }

      await cartService.addToCart(product.id, 1);
      alert('✓ Produk ditambahkan ke keranjang!');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error: any) {
      alert('❌ ' + (error.message || 'Gagal menambahkan ke keranjang'));
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/sign-in?redirect=/');
      return;
    }

    // TODO: Implement wishlist functionality
    alert('Fitur wishlist segera hadir!');
  };

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative bg-surface rounded-2xl p-6 mb-4 overflow-hidden transition-all duration-300 hover:shadow-soft">
         {/* Badges */}
         <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {product.discount && (
               <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
                 {product.discount}% off
               </span>
            )}
         </div>

         {/* Actions (Hover) */}
         <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <button 
              onClick={handleAddToWishlist}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-colors"
            >
              <Heart size={14} />
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/product/${product.id}`);
              }}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:bg-secondary hover:text-white transition-colors"
            >
              <Eye size={14} />
            </button>
         </div>

         {/* Image Container - Taller for books */}
         <div className="h-64 flex items-center justify-center relative">
            {/* We use object-cover with a slight shadow to make the book 'pop' like an illustration */}
            <div className="w-40 h-56 shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2 relative">
                <img 
                    src={product.image} 
                    alt={product.title} 
                    className="w-full h-full object-cover rounded-sm" 
                />
                {/* Book Spine Effect (Subtle) */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
            </div>
         </div>

         {/* Add to Cart Button (Slide Up) */}
         <button 
           onClick={handleAddToCart}
           disabled={adding}
           className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 w-max disabled:opacity-50"
         >
           <ShoppingCart size={12} /> {adding ? 'Menambahkan...' : 'Tambah ke Keranjang'}
         </button>
      </div>

      {/* Info */}
      <div className="px-2 text-center">
         <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wide">{product.category_id ? 'Kategori' : 'Buku'}</p>
         <h3 className="text-primary font-bold text-lg mb-1 group-hover:text-secondary transition-colors cursor-pointer">{product.title}</h3>
         <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-primary font-bold">{formatRupiah(Number(product.price))}</span>
            {product.original_price && (
               <span className="text-gray-400 text-sm line-through">{formatRupiah(Number(product.original_price))}</span>
            )}
         </div>
         <div className="flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
               <Star key={i} size={12} fill={i < Math.floor(product.rating) ? "#F5BE30" : "#E5E7EB"} className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-200"} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
         </div>
      </div>
    </Link>
  );
};

export default ProductSection;