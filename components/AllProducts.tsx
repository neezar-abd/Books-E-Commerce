'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
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
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20; // 5 columns x 4 rows

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
    if (selectedCategory !== 'all') {
      fetchSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategories([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    applyFilters();
  }, [products, searchTerm, selectedCategory, selectedSubcategories, priceRange, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or('moderation_status.eq.approved,moderation_status.is.null');

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
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async (categoryName: string) => {
    try {
      const category = categories.find(cat => cat.id === categoryName);
      if (!category) return;

      const response = await fetch(`/api/categories?kategori=${encodeURIComponent(category.name)}`);
      const result = await response.json();

      if (result.success) {
        setSubcategories(result.data);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategories([]);
  };

  const handleSubcategoryToggle = (subcategoryName: string) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategoryName)) {
        return prev.filter(s => s !== subcategoryName);
      } else {
        return [...prev, subcategoryName];
      }
    });
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
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
        filtered.sort((a, b) => (b.total_sold || 0) - (a.total_sold || 0));
        break;
      default:
        // newest
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategories([]);
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
      <div className="container mx-auto px-4 max-w-[1400px]">
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

        {/* Main Layout: Sidebar + Products */}
        <div className="flex gap-4">
          {/* Left Sidebar - Fixed width */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-5 sticky top-24">
              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b">Kategori</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-sm hover:text-primary">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Semua</span>
                  </label>
                  {categories.map(category => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer text-sm hover:text-primary">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={selectedCategory === category.id}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="text-primary focus:ring-primary"
                      />
                      <span>{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subcategories Filter - Only show when category is selected */}
              {subcategories.length > 0 && (
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-primary">Sub Kategori</h3>
                    {selectedSubcategories.length > 0 && (
                      <button
                        onClick={() => setSelectedSubcategories([])}
                        className="text-xs text-primary hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {subcategories.map((subcat, index) => (
                      <label
                        key={index}
                        className="flex items-center gap-2 cursor-pointer text-sm hover:text-primary group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubcategories.includes(subcat.name)}
                          onChange={() => handleSubcategoryToggle(subcat.name)}
                          className="text-primary focus:ring-primary rounded"
                        />
                        <span className="group-hover:translate-x-1 transition-transform text-xs">
                          {subcat.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div>
                <h3 className="text-sm font-bold text-primary mb-3 pb-2 border-b">Rentang Harga</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Min</label>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      min="0"
                      placeholder="Rp 0"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Max</label>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                      min="0"
                      placeholder="Rp 1.000.000"
                    />
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              {(selectedCategory !== 'all' || selectedSubcategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 1000000) && (
                <button
                  onClick={resetFilters}
                  className="w-full mt-4 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all text-sm"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </aside>

          {/* Right Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-bold text-primary">{filteredProducts.length}</span> produk
                  {searchTerm && <span> untuk "{searchTerm}"</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Urutkan:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm cursor-pointer"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="popular">Terpopuler</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="price-low">Harga Terendah</option>
                    <option value="price-high">Harga Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Grid - 5 columns */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl">
                <div className="text-5xl mb-4">📦</div>
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
                {/* 5 columns on lg+, responsive on smaller screens */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {currentProducts.map((product, index) => (
                    <div key={product.id}>
                      <ProductCard product={product} index={startIndex + index} />
                    </div>
                  ))}
                </div>

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
        </div>
      </div>
    </section>
  );
};

export default AllProducts;
