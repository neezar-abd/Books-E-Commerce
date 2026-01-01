'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';
import { SlideIn } from './AnimationWrappers';

const RecommendedProducts: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('Rekomendasi Untuk Anda');

    useEffect(() => {
        fetchRecommendedProducts();
    }, []);

    const fetchRecommendedProducts = async () => {
        try {
            setLoading(true);

            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();

            let recommendedProducts: any[] = [];

            if (user) {
                // USER LOGGED IN: Personalized recommendations
                setTitle('Rekomendasi Untuk Anda');

                // Step 1: Get user's order history to find preferred categories
                const { data: orders } = await supabase
                    .from('orders')
                    .select(`
            id,
            order_items (
              product_id,
              products (
                category_id
              )
            )
          `)
                    .eq('user_id', user.id)
                    .limit(10);

                // Extract category IDs from order history
                const categoryIds = new Set<string>();
                orders?.forEach(order => {
                    order.order_items?.forEach((item: any) => {
                        if (item.products?.category_id) {
                            categoryIds.add(item.products.category_id);
                        }
                    });
                });

                if (categoryIds.size > 0) {
                    // Fetch products from user's preferred categories
                    const { data: categoryProducts } = await supabase
                        .from('products')
                        .select('*')
                        .in('category_id', Array.from(categoryIds))
                        .order('total_sold', { ascending: false })
                        .limit(12);

                    recommendedProducts = categoryProducts || [];
                }

                // If not enough products, fill with best sellers
                if (recommendedProducts.length < 12) {
                    const { data: bestSellers } = await supabase
                        .from('products')
                        .select('*')
                        .order('total_sold', { ascending: false })
                        .limit(12 - recommendedProducts.length);

                    recommendedProducts = [...recommendedProducts, ...(bestSellers || [])];
                }

            } else {
                // USER NOT LOGGED IN: Show trending/popular products
                setTitle('Produk Terlaris');

                const { data: trending } = await supabase
                    .from('products')
                    .select('*')
                    .order('total_sold', { ascending: false })
                    .limit(12);

                recommendedProducts = trending || [];
            }

            setProducts(recommendedProducts);

        } catch (error) {
            console.error('Error fetching recommendations:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-12 bg-white">
            <div className="container-80">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-secondary" size={28} />
                        <h2 className="text-2xl md:text-3xl font-bold text-primary">
                            {title}
                        </h2>
                    </div>
                    <Link
                        href="/products"
                        className="text-secondary hover:text-primary transition-colors flex items-center gap-2 font-medium"
                    >
                        Lihat Semua
                        <ArrowRight size={18} />
                    </Link>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg p-3 animate-pulse">
                                <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                                <div className="h-4 bg-gray-200 rounded mb-2" />
                                <div className="h-4 bg-gray-200 rounded w-2/3" />
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Belum ada rekomendasi produk
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {products.map((product, index) => (
                            <div key={product.id}>
                                <ProductCard product={product} index={index} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default RecommendedProducts;
