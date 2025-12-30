'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Star, Package, MessageCircle, CheckCircle, Search } from 'lucide-react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { StaggerContainer, staggerItem } from '@/components/AnimationWrappers';

interface StoreData {
    id: string;
    name: string;
    slug: string;
    logo: string;
    banner: string;
    description: string;
    city: string;
    province: string;
    rating: number;
    review_count: number;
    total_products: number;
    total_sales: number;
    is_verified: boolean;
}

export default function StorePage() {
    const params = useParams();
    const slug = params?.slug as string;

    const [store, setStore] = useState<StoreData | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (slug) {
            fetchStoreData();
        }
    }, [slug]);

    const fetchStoreData = async () => {
        try {
            // Get store by slug
            const { data: storeData, error: storeError } = await supabase
                .from('stores')
                .select('*')
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (storeError || !storeData) {
                console.error('Store not found');
                setLoading(false);
                return;
            }

            setStore(storeData);

            // Get store products
            const { data: productsData } = await supabase
                .from('products')
                .select('*')
                .eq('store_id', storeData.id)
                .order('created_at', { ascending: false });

            setProducts(productsData || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products
        .filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'bestseller':
                    return (b.sales || 0) - (a.sales || 0);
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-surface">
                <Header />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!store) {
        return (
            <div className="min-h-screen bg-surface">
                <Header />
                <div className="container-80 py-20 text-center">
                    <Store size={64} className="mx-auto mb-4 text-gray-300" />
                    <h1 className="text-2xl font-bold text-primary mb-2">Toko Tidak Ditemukan</h1>
                    <p className="text-gray-500">Toko yang Anda cari tidak tersedia.</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface">
            <Header />

            {/* Store Banner */}
            <div className="relative h-48 md:h-64 bg-gradient-to-r from-primary to-primary/80">
                {store.banner && (
                    <img
                        src={store.banner}
                        alt={store.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-30"
                    />
                )}
            </div>

            {/* Store Info Card */}
            <div className="container-80 -mt-20 relative z-10 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Store Logo */}
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 mx-auto md:mx-0">
                            {store.logo ? (
                                <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <Store size={40} />
                                </div>
                            )}
                        </div>

                        {/* Store Details */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                <h1 className="text-2xl font-bold text-primary">{store.name}</h1>
                                {store.is_verified && (
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                                        <CheckCircle size={12} /> Verified
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 mb-3">
                                <span className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    {store.city}, {store.province}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={14} fill="#F5BE30" className="text-secondary" />
                                    {store.rating || '0.0'} ({store.review_count || 0} ulasan)
                                </span>
                            </div>

                            {store.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>
                            )}

                            <div className="flex items-center justify-center md:justify-start gap-6">
                                <div className="text-center">
                                    <p className="text-xl font-bold text-primary">{store.total_products}</p>
                                    <p className="text-xs text-gray-500">Produk</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-bold text-primary">{store.total_sales}</p>
                                    <p className="text-xs text-gray-500">Terjual</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 items-center md:items-end">
                            <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                                <MessageCircle size={16} />
                                Chat Penjual
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Products Section */}
            <div className="container-80 pb-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h2 className="text-xl font-bold text-primary">Produk Toko ({products.length})</h2>

                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari di toko ini..."
                                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="newest">Terbaru</option>
                            <option value="bestseller">Terlaris</option>
                            <option value="price-low">Harga Terendah</option>
                            <option value="price-high">Harga Tertinggi</option>
                        </select>
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <StaggerContainer staggerDelay={0.03}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                            {filteredProducts.map((product, index) => (
                                <motion.div key={product.id} variants={staggerItem}>
                                    <ProductCard product={product} index={index} />
                                </motion.div>
                            ))}
                        </div>
                    </StaggerContainer>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-primary mb-2">Tidak Ada Produk</h3>
                        <p className="text-gray-500">
                            {search ? 'Produk tidak ditemukan untuk pencarian ini' : 'Toko ini belum memiliki produk'}
                        </p>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
