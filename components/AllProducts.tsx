'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { Star, ShoppingCart, Heart, Eye, Search, Filter, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';
import { cartService } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

const AllProducts: React.FC = () => {
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
  const itemsPerPage = 12;

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
    <section className="bg-white pb-20">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <FadeIn delay={0.1}>
          <div className="mb-6 pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <span>/</span>
              <span className="text-primary font-medium">Semua Produk</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Semua Produk
            </h1>
          </div>
        </FadeIn>

        {/* Search & Filter Bar */}
        <FadeIn delay={0.2}>
          <div className="bg-surface rounded-2xl p-6 mb-8 shadow-soft">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari judul buku, penulis, atau kategori..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer bg-white"
                >
                  <option value="newest">Terbaru</option>
                  <option value="popular">Terpopuler</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="price-low">Harga: Rendah ke Tinggi</option>
                  <option value="price-high">Harga: Tinggi ke Rendah</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 justify-center"
              >
                <Filter size={20} />
                <span>Filter</span>
              </button>
            </div>

            {/* Active Filters Info */}
            {(searchTerm || selectedCategory !== 'all' || priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-600">Filter aktif:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    "{searchTerm}"
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {selectedCategory}
                  </span>
                )}
                {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
                    {formatRupiah(priceRange[0])} - {formatRupiah(priceRange[1])}
                  </span>
                )}
                <button
                  onClick={resetFilters}
                  className="ml-2 text-sm text-gray-500 hover:text-primary underline"
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
              className="overflow-hidden mb-8"
            >
              <div className="bg-surface rounded-2xl p-6 shadow-soft">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-lg font-bold text-primary mb-4">Kategori</h3>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
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
                        <label key={category} className="flex items-center gap-2 cursor-pointer">
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
                    <h3 className="text-lg font-bold text-primary mb-4">Rentang Harga</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 mb-1 block">Minimum</label>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            min="0"
                          />
                        </div>
                        <span className="text-gray-400 mt-6">-</span>
                        <div className="flex-1">
                          <label className="text-sm text-gray-600 mb-1 block">Maximum</label>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatRupiah(priceRange[0])} - {formatRupiah(priceRange[1])}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="mb-6 text-gray-600">
          Menampilkan <span className="font-bold text-primary">{filteredProducts.length}</span> produk
          {searchTerm && <span> untuk "{searchTerm}"</span>}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Memuat produk...</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-primary mb-2">Produk tidak ditemukan</h3>
            <p className="text-gray-600 mb-6">Coba ubah filter atau kata kunci pencarian</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <StaggerContainer staggerDelay={0.05}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {currentProducts.map(product => (
                  <motion.div key={product.id} variants={staggerItem}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            </StaggerContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-16 mb-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        currentPage === i + 1
                          ? 'bg-primary text-white'
                          : 'border border-gray-200 hover:bg-surface'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-surface transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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

// Product Card Component (sama seperti di ProductSection)
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
        router.push('/sign-in?redirect=/products');
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
      router.push('/sign-in?redirect=/products');
      return;
    }

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
          {product.is_featured && (
            <span className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded">
              Featured
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

        {/* Image Container */}
        <div className="h-64 flex items-center justify-center relative">
          <div className="w-40 h-56 shadow-md transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-2 relative">
            <img 
              src={product.image} 
              alt={product.title} 
              className="w-full h-full object-cover rounded-sm" 
            />
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-r from-white/20 to-transparent opacity-50"></div>
          </div>
        </div>

        {/* Add to Cart Button */}
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
        <p className="text-gray-400 text-xs font-medium mb-1 uppercase tracking-wide">
          {product.category_id ? 'Kategori' : 'Buku'}
        </p>
        <h3 className="text-primary font-bold text-lg mb-1 group-hover:text-secondary transition-colors cursor-pointer line-clamp-2">
          {product.title}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-primary font-bold">{formatRupiah(Number(product.price))}</span>
          {product.original_price && (
            <span className="text-gray-400 text-sm line-through">
              {formatRupiah(Number(product.original_price))}
            </span>
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              size={12} 
              fill={i < Math.floor(product.rating || 0) ? "#F5BE30" : "#E5E7EB"} 
              className={i < Math.floor(product.rating || 0) ? "text-secondary" : "text-gray-200"} 
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.rating || 0})</span>
        </div>
      </div>
    </Link>
  );
};

export default AllProducts;
