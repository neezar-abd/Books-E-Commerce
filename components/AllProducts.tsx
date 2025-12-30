'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';
import { supabase } from '@/lib/supabase';
import ProductCard from './ProductCard';

const AllProducts: React.FC = () => {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18; // 6 columns x 3 rows

  // Read search query from URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
    const urlCategory = searchParams.get('category');
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name');

      if (error) throw error;
      setCategories(data?.map(cat => cat.name) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Price range filter
    filtered = filtered.filter(product => {
      const price = Number(product.price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        filtered.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 1000000]);
    setSortBy('newest');
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <section className="bg-surface min-h-screen pb-20">
      <div className="container-80">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="mb-4 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">Semua Produk</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Semua Produk
            </h1>
          </div>
        </FadeIn>

        {/* Filter Bar */}
        <FadeIn delay={0.2}>
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer bg-white text-sm"
                >
                  <option value="newest">Terbaru</option>
                  <option value="popular">Terpopuler</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 justify-center text-sm"
              >
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>

            {/* Active Filters Info */}
            {(searchTerm || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-600">Filter aktif:</span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    "{searchTerm}"
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {selectedCategory}
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {formatRupiah(priceRange[0])} - {formatRupiah(priceRange[1])}
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="ml-2 text-xs text-gray-500 hover:text-primary underline"
                >
                  Reset semua
                </button>
              </div>
            )}
          </div>
        </FadeIn>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-3">Kategori</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={selectedCategory === 'all'}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700">Semua Kategori</span>
                      </label>
                      {categories.map(category => (
                        <label key={category} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="radio"
                            name="category"
                            value={category}
                            checked={selectedCategory === category}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="text-primary focus:ring-primary"
                          />
                          <span className="text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-3">Rentang Harga</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 mb-1 block">Min</label>
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                          min="0"
                        />
                      </div>
                      <span className="text-gray-400 mt-5">-</span>
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 mb-1 block">Max</label>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Menampilkan <span className="font-bold text-primary">{filteredProducts.length}</span> produk
          {searchTerm && <span> untuk "{searchTerm}"</span>}
        </div>

        {/* Products Grid - 6 columns desktop, 2 mobile */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-primary mb-2">Produk tidak ditemukan</h3>
            <p className="text-gray-600 mb-4 text-sm">Coba ubah filter atau kata kunci pencarian</p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all text-sm"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <StaggerContainer staggerDelay={0.03}>
              {/* 6 columns on xl, 5 on lg, 4 on md, 3 on sm, 2 on mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {currentProducts.map((product, index) => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard product={product} index={startIndex + index} />
                  </motion.div>
                ))}
              </div>
            </StaggerContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Prev
                </button>

                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-lg transition-all text-sm ${currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 hover:bg-white'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default AllProducts;
