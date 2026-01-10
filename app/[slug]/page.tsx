'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ChevronDown } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import LocationFilter from '@/components/LocationFilter';
import BrandFilter from '@/components/BrandFilter';
import { supabase } from '@/lib/supabase';

interface SubCategory {
  name: string;
  count?: number;
}

export default function CategoryPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // Parse slug: "pakaian-pria-cat.100047"
  const fullSlug = params.slug as string;
  const parts = fullSlug?.split('-cat.') || [];
  const categorySlug = parts[0] || '';
  const categoryId = parts[1] || '';

  const selectedSub = searchParams.get('sub');
  const selectedSub2 = searchParams.get('sub2');

  const [categoryName, setCategoryName] = useState('');
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [subSubcategories, setSubSubcategories] = useState<Record<string, string[]>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSub, setExpandedSub] = useState<string | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [showAllSubcategories, setShowAllSubcategories] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  useEffect(() => {
    if (categoryId) {
      loadCategoryData();
      fetchProducts();
    }
  }, [categoryId, selectedSub, selectedSub2, selectedBrand]);

  const loadCategoryData = async () => {
    if (!categoryId) return;

    try {
      // Get category from database
      const response = await fetch(`/api/sync-categories?id=${categoryId}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const mainCategory = result.data[0].main_category;
        setCategoryName(mainCategory);

        // Get all unique subcategories for this main category
        const subcatsResponse = await fetch(`/api/sync-categories?main=${encodeURIComponent(mainCategory)}`);
        const subcatsResult = await subcatsResponse.json();

        if (subcatsResult.success) {
          // Get unique sub1 values
          const uniqueSub1 = Array.from(
            new Set(
              subcatsResult.data
                .filter((item: any) => item.sub1)
                .map((item: any) => item.sub1)
            )
          ).map(name => ({ name: name as string }));

          setSubcategories(uniqueSub1);
          return;
        }
      }

      // If API fails, show empty state
      console.log('Category not found in database');
      setCategoryName('Kategori Tidak Ditemukan');
      setSubcategories([]);
    } catch (error) {
      console.error('Error loading category:', error);
      setCategoryName('Kategori Tidak Ditemukan');
      setSubcategories([]);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      // Filter by category_main if you have the field
      if (categoryName) {
        query = query.eq('category_main', categoryName);
      }

      // Filter by subcategory if selected
      if (selectedSub) {
        query = query.eq('category_sub1', selectedSub);
      }

      if (selectedSub2) {
        query = query.eq('category_sub2', selectedSub2);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply location and brand filters
  useEffect(() => {
    let filtered = [...products];

    // Location filter
    if (selectedProvinceId) {
      filtered = filtered.filter(p => p.province_id === selectedProvinceId);
    }
    if (selectedCityId) {
      filtered = filtered.filter(p => p.city_id === selectedCityId);
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand && p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    setFilteredProducts(filtered);
  }, [products, selectedProvinceId, selectedCityId, selectedBrand]);

  const handleLocationChange = (provinceId: string | null, cityId: string | null) => {
    setSelectedProvinceId(provinceId);
    setSelectedCityId(cityId);
  };

  const getSubSubcategories = (subcatName: string) => {
    // Return cached if available
    if (subSubcategories[subcatName]) {
      return subSubcategories[subcatName];
    }

    // Fetch asynchronously when not cached
    fetchSubSubcategories(subcatName);

    // Return empty while loading
    return [];
  };

  const fetchSubSubcategories = async (subcatName: string) => {
    try {
      // Try API first
      const response = await fetch(
        `/api/sync-categories?main=${encodeURIComponent(categoryName)}&sub1=${encodeURIComponent(subcatName)}`
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        const uniqueSub2 = Array.from(
          new Set(
            result.data
              .filter((item: any) => item.sub2 && item.sub2 !== '-')
              .map((item: any) => item.sub2)
          )
        ) as string[];

        setSubSubcategories(prev => ({
          ...prev,
          [subcatName]: uniqueSub2
        }));
        return;
      }

      // If API fails, set empty array
      setSubSubcategories(prev => ({
        ...prev,
        [subcatName]: []
      }));
    } catch (error) {
      console.error('Error fetching sub-subcategories:', error);
      setSubSubcategories(prev => ({
        ...prev,
        [subcatName]: []
      }));
    }
  };

  return (
    <div className="min-h-screen font-sans text-primary bg-surface">
      <Header />

      <main className="pt-6 pb-8">
        <div className="container mx-auto px-4 max-w-[1400px]">
          {/* Breadcrumb */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              <Link href="/" className="hover:text-primary transition-colors">
                Beranda
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-medium">{categoryName}</span>
              {selectedSub && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-primary font-medium">{selectedSub}</span>
                </>
              )}
              {selectedSub2 && (
                <>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-primary font-medium">{selectedSub2}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            {/* Sidebar - Shopee Style */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white overflow-hidden shadow-sm">
                {/* Main Category Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h3 className="font-bold text-primary">{categoryName}</h3>
                  </div>
                </div>

                {/* Subcategories List */}
                <div className="divide-y">
                  <Link
                    href={`/${fullSlug}`}
                    className={`block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${!selectedSub ? 'text-primary font-medium bg-orange-50' : 'text-gray-700'
                      }`}
                  >
                    Semua Produk
                  </Link>

                  {subcategories
                    .slice(0, showAllSubcategories ? subcategories.length : 7)
                    .map((subcat, index) => {
                      const subSubcats = getSubSubcategories(subcat.name);
                      const hasChildren = subSubcats.length > 0;
                      const isExpanded = expandedSub === subcat.name;
                      const isSelected = selectedSub === subcat.name;

                      return (
                        <div key={index}>
                          <div className="flex items-center">
                            <Link
                              href={`/${fullSlug}?sub=${encodeURIComponent(subcat.name)}`}
                              className={`flex-1 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${isSelected ? 'text-primary font-medium bg-orange-50' : 'text-gray-700'
                                }`}
                            >
                              {subcat.name}
                            </Link>
                            {hasChildren && (
                              <button
                                onClick={() => setExpandedSub(isExpanded ? null : subcat.name)}
                                className="px-3 py-2.5 hover:bg-gray-50"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                            )}
                          </div>

                          {/* Sub-subcategories */}
                          {hasChildren && isExpanded && (
                            <div className="bg-gray-50 border-t">
                              {subSubcats.map((subSubcat, idx) => (
                                <Link
                                  key={idx}
                                  href={`/${fullSlug}?sub=${encodeURIComponent(subcat.name)}&sub2=${encodeURIComponent(subSubcat)}`}
                                  className={`block px-8 py-2 text-xs hover:text-primary hover:bg-white transition-colors ${selectedSub2 === subSubcat ? 'text-primary font-medium' : 'text-gray-600'
                                    }`}
                                >
                                  {subSubcat}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {/* "Lainnya" toggle if more categories */}
                  {subcategories.length > 7 && (
                    <button
                      onClick={() => setShowAllSubcategories(!showAllSubcategories)}
                      className="w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <span>{showAllSubcategories ? 'Lebih Sedikit' : 'Lainnya'}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllSubcategories ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white overflow-hidden shadow-sm mt-4 p-4">
                <h3 className="font-bold text-sm mb-3 pb-2 border-b">Filter</h3>

                <div className="space-y-4 text-sm">
                  {/* Location Filter */}
                  <div>
                    <p className="text-gray-600 font-medium mb-2">Lokasi Penjual</p>
                    <LocationFilter
                      onFilterChange={handleLocationChange}
                      className="border-0 shadow-none"
                    />
                  </div>

                  {/* Brand Filter */}
                  <BrandFilter
                    category={categoryName}
                    subcategory={selectedSub || undefined}
                    selectedBrand={selectedBrand}
                    onFilterChange={setSelectedBrand}
                    className="border-0 shadow-none"
                  />

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
              {/* Sort Bar */}
              <div className="bg-white p-4 mb-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-primary">{filteredProducts.length}</span> Produk
                    {(selectedProvinceId || selectedCityId) && (
                      <span className="text-orange-500 ml-2">(filtered by location)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-600">Urutkan:</span>
                    <button className="px-3 py-1 hover:text-primary">Terbaru</button>
                    <button className="px-3 py-1 hover:text-primary">Terlaris</button>
                    <button className="px-3 py-1 hover:text-primary">Harga</button>
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
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white">
                  <p className="text-gray-500">Tidak ada produk ditemukan</p>
                </div>
              )}

              {/* Pagination */}
              {filteredProducts.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((page) => (
                      <button
                        key={page}
                        className={`w-10 h-10 ${page === 1
                          ? 'bg-primary text-white'
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                          }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
