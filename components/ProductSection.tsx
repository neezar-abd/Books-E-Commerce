'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Truck } from 'lucide-react';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';

const ProductSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Semua Produk');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const tabs = ['Semua Produk', 'Terbaru', 'Terlaris', 'Promo'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(6); // Show 6 products on homepage

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
    <section className="py-6 bg-surface" id="products">
      <div className="container-80">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary">REKOMENDASI</h2>
          <Link href="/products" className="text-sm text-secondary hover:underline">
            Lihat Semua
          </Link>
        </div>

        {/* Tabs */}
        <StaggerContainer staggerDelay={0.05}>
          <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
            {tabs.map(tab => (
              <motion.button
                key={tab}
                variants={staggerItem}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {tab}
              </motion.button>
            ))}
          </div>
        </StaggerContainer>

        {/* Grid - 6 columns desktop, 2 mobile */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : (
          <StaggerContainer staggerDelay={0.05}>
            {/* 6 columns on xl, 5 on lg, 4 on md, 3 on sm, 2 on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {products.map((product, index) => (
                <motion.div key={product.id} variants={staggerItem}>
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </div>
          </StaggerContainer>
        )}

        {/* View All Button */}
        <FadeIn delay={0.2}>
          <div className="text-center mt-6">
            <Link
              href="/products"
              className="inline-block px-6 py-2.5 bg-white text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all font-medium text-sm"
            >
              Lihat Semua Produk
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ProductSection;
