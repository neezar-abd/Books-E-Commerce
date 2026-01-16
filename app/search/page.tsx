'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LocationFilter from '@/components/LocationFilter';
import { supabase } from '@/lib/supabase';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || searchParams.get('search') || '';

    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
    const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (query) {
            fetchProducts();
        } else {
            setProducts([]);
            setFilteredProducts([]);
            setLoading(false);
        }
    }, [query]);

    // Apply filters
    useEffect(() => {
        let filtered = [...products];

        // Location filter
        if (selectedProvinceId) {
            filtered = filtered.filter(p => p.province_id === selectedProvinceId);
        }
        if (selectedCityId) {
            filtered = filtered.filter(p => p.city_id === selectedCityId);
        }

        // Sorting
        switch (sortBy) {
            case 'price-low':
                filtered.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case 'price-high':
                filtered.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            case 'popular':
                filtered.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
                break;
            default:
                filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        setFilteredProducts(filtered);
    }, [products, selectedProvinceId, selectedCityId, sortBy]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('is_active', true)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);

            if (error) throw error;
            setProducts(data || []);
            setFilteredProducts(data || []);
        } catch (error) {
            console.error('Error searching products:', error);
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationChange = (provinceId: string | null, cityId: string | null) => {
        setSelectedProvinceId(provinceId);
        setSelectedCityId(cityId);
    };

    return (
        <main className="pt-6 pb-8">
            <div className="container-80">
                {/* Breadcrumb */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Link href="/" className="hover:text-primary transition-colors">
                            Beranda
                        </Link>
                        <ChevronRight className="w-4 h-4" />
                        <span className="text-primary font-medium">
                            Pencarian: "{query}"
                        </span>
                    </div>
                </div>

                <div className="flex gap-4">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-56 flex-shrink-0">
                        <div className="bg-white overflow-hidden shadow-sm p-4 sticky top-24">
                            <h3 className="font-bold text-sm mb-3 pb-2 border-b flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Filter Pencarian
                            </h3>

                            <div className="space-y-4 text-sm">
                                {/* Location Filter */}
                                <div>
                                    <p className="text-gray-600 font-medium mb-2">Lokasi Penjual</p>
                                    <LocationFilter
                                        onFilterChange={handleLocationChange}
                                        className="border-0 shadow-none"
                                    />
                                </div>

                                {/* Price Filter */}
                                <div>
                                    <p className="text-gray-600 font-medium mb-2">Harga</p>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-full px-2 py-1 border rounded text-xs"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-full px-2 py-1 border rounded text-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Results Header */}
                        <div className="bg-white p-4 mb-4 shadow-sm">
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium text-primary">{filteredProducts.length}</span> hasil untuk "{query}"
                                    {(selectedProvinceId || selectedCityId) && (
                                        <span className="text-orange-500 ml-2">(lokasi difilter)</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Urutkan:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-3 py-1.5 border rounded text-sm"
                                    >
                                        <option value="newest">Terbaru</option>
                                        <option value="popular">Terlaris</option>
                                        <option value="price-low">Harga Terendah</option>
                                        <option value="price-high">Harga Tertinggi</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {[...Array(20)].map((_, i) => (
                                    <div key={i} className="bg-white aspect-square animate-pulse" />
                                ))}
                            </div>
                        ) : !query ? (
                            <div className="text-center py-20 bg-white">
                                <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 mb-2">Masukkan kata kunci pencarian</h3>
                                <p className="text-gray-500 text-sm">Cari produk yang Anda inginkan</p>
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-lg font-medium text-gray-700 mb-2">
                                    Tidak ada hasil untuk "{query}"
                                </h3>
                                <p className="text-gray-500 text-sm mb-4">
                                    Coba kata kunci lain atau hapus filter lokasi
                                </p>
                                {(selectedProvinceId || selectedCityId) && (
                                    <button
                                        onClick={() => {
                                            setSelectedProvinceId(null);
                                            setSelectedCityId(null);
                                        }}
                                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm"
                                    >
                                        Reset Filter Lokasi
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen font-sans text-primary bg-surface">
            <Header />
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            }>
                <SearchContent />
            </Suspense>
            <Footer />
        </div>
    );
}
