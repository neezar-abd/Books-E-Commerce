'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Share2, Truck, Loader2, Store, MapPin, ChevronRight } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { cartService } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { browsingHistory } from '@/lib/browsing-history';
import { getProductVariants, getProductCombinations, ProductVariant } from '@/lib/product-variants';

interface Product {
  id: string;
  title: string;
  brand?: string;
  sku?: string;
  weight_grams?: number;
  condition?: string;
  price: number;
  original_price?: number;
  stock: number;
  rating?: number;
  total_sold?: number;
  total_reviews?: number;
  description: string;
  image: string;
  images?: string[];
  category_id?: string;
  store_id?: string;
  min_purchase?: number;
  max_purchase?: number;
  stores?: {
    name: string;
    slug: string;
    city: string;
    is_verified: boolean;
  };
}

interface TransformedCombination {
  id: string;
  product_id: string;
  combination: Record<string, string>;
  price: number;
  stock: number;
  sku: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const ProductDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [combinations, setCombinations] = useState<TransformedCombination[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedCombination, setSelectedCombination] = useState<TransformedCombination | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProductData();
  }, [params?.id]);

  useEffect(() => {
    if (combinations.length > 0 && Object.keys(selectedVariants).length > 0) {
      const matching = combinations.find(c =>
        JSON.stringify(c.combination) === JSON.stringify(selectedVariants)
      );
      setSelectedCombination(matching || null);
    }
  }, [selectedVariants, combinations]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError(null);

      const productId = params?.id as string;
      if (!productId) {
        setError('Product ID not found');
        return;
      }

      const { data: productData, error: fetchError } = await supabase
        .from('products')
        .select('*, stores(name, slug, city, is_verified)')
        .eq('id', productId)
        .single();

      if (fetchError) throw fetchError;
      if (!productData) {
        setError('Produk tidak ditemukan');
        return;
      }

      setProduct(productData);

      if (productData.id && productData.category_id) {
        browsingHistory.addProduct(productData.id, productData.category_id);
      }

      const variantsData = await getProductVariants(productId);
      setVariants(variantsData);

      const combinationsData = await getProductCombinations(productId);
      const transformedCombinations = combinationsData.map(c => ({
        ...c,
        combination: c.combination.reduce((acc, item) => ({
          ...acc,
          [item.type]: item.value
        }), {} as Record<string, string>)
      }));
      setCombinations(transformedCombinations);

      if (transformedCombinations.length > 0) {
        const firstCombo = transformedCombinations[0];
        setSelectedVariants(firstCombo.combination);
        setSelectedCombination(firstCombo);
      }

    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  const handleVariantSelect = (type: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setIsAddingToCart(true);
      await cartService.addToCart(product.id, quantity);
      alert(`Ditambahkan ke keranjang: ${quantity} x ${product.title}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const getVariantTypes = (): string[] => {
    return Array.from(new Set(variants.map(v => v.variant_type)));
  };

  const getVariantValues = (type: string): ProductVariant[] => {
    return variants.filter(v => v.variant_type === type);
  };

  const getDisplayPrice = (): number => {
    if (selectedCombination) {
      return selectedCombination.price;
    }
    return product?.price || 0;
  };

  const getDisplayStock = (): number => {
    if (selectedCombination) {
      return selectedCombination.stock;
    }
    return product?.stock || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Produk tidak ditemukan'}</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-primary text-white px-6 py-2"
          >
            Kembali ke Produk
          </button>
        </div>
      </div>
    );
  }

  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const displayStock = getDisplayStock();
  const minPurchase = product.min_purchase || 1;
  const maxPurchase = product.max_purchase || displayStock;

  return (
    <div className="min-h-screen bg-surface">
      <div className="container-80 py-4">

        {/* Breadcrumb - Shopee Style */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <Link href="/" className="hover:text-primary">Zaree</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:text-primary">Produk</Link>
          <ChevronRight size={12} />
          <span className="text-primary">{product.title.length > 40 ? product.title.substring(0, 40) + '...' : product.title}</span>
        </div>

        {/* Main Product Card */}
        <div className="bg-white p-4">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Left: Product Images */}
            <div className="lg:w-[400px] flex-shrink-0">
              {/* Main Image */}
              <div className="relative w-full aspect-square border border-gray-200 overflow-hidden mb-3">
                <img
                  src={allImages[currentImageIndex]}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 mb-4">
                {allImages.slice(0, 5).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-[72px] h-[72px] border-2 overflow-hidden flex-shrink-0 ${idx === currentImageIndex ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              {/* Share & Favorite Row */}
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Share:</span>
                  <div className="flex gap-1">
                    <button className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                    </button>
                    <button className="w-6 h-6 rounded-full bg-blue-400 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                    </button>
                    <button className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" /></svg>
                    </button>
                    <button className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Heart size={16} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
                  <span>Favorit ({product.total_reviews || 0})</span>
                </button>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex-1 min-w-0">
              {/* Title */}
              <h1 className="text-lg font-medium text-primary leading-snug mb-3">
                {product.title}
              </h1>

              {/* Rating & Stats Row */}
              <div className="flex items-center gap-3 text-sm mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  <span className="text-primary font-medium">{product.rating || 0}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(product.rating || 0) ? "fill-secondary text-secondary" : "text-gray-300"} />
                    ))}
                  </div>
                </div>
                <span className="text-gray-300">|</span>
                <div>
                  <span className="text-primary font-medium">{product.total_reviews || 0}</span>
                  <span className="text-gray-500 ml-1">Penilaian</span>
                </div>
                <span className="text-gray-300">|</span>
                <div>
                  <span className="text-primary font-medium">{product.total_sold || 0}</span>
                  <span className="text-gray-500 ml-1">Terjual</span>
                </div>
              </div>

              {/* Price */}
              <div className="bg-gray-50 px-4 py-3 mb-4">
                <span className="text-3xl font-medium text-primary">
                  {formatRupiah(getDisplayPrice())}
                </span>
              </div>

              {/* Shipping */}
              <div className="flex items-start gap-8 py-3 text-sm border-b border-gray-100">
                <span className="text-gray-500 w-24 flex-shrink-0">Pengiriman</span>
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-gray-400" />
                  <span className="text-gray-700">Jasa Kirim Toko</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </div>
              </div>

              {/* Variants */}
              {getVariantTypes().length > 0 && (
                <div className="py-3 border-b border-gray-100">
                  {getVariantTypes().map(type => (
                    <div key={type} className="flex items-start gap-8 text-sm mb-3 last:mb-0">
                      <span className="text-gray-500 w-24 flex-shrink-0">{type}</span>
                      <div className="flex flex-wrap gap-2">
                        {getVariantValues(type).map((variant) => (
                          <button
                            key={variant.id}
                            onClick={() => handleVariantSelect(type, variant.variant_value)}
                            className={`px-3 py-1.5 border text-sm ${selectedVariants[type] === variant.variant_value
                              ? 'border-primary text-primary bg-primary/5'
                              : 'border-gray-300 text-gray-700 hover:border-primary'
                              }`}
                          >
                            {variant.variant_value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-8 py-4 text-sm">
                <span className="text-gray-500 w-24 flex-shrink-0">Kuantitas</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300">
                    <button
                      onClick={() => setQuantity(Math.max(minPurchase, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                    >
                      −
                    </button>
                    <span className="w-12 h-8 flex items-center justify-center border-x border-gray-300 text-primary font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(maxPurchase, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-gray-500">Tersedia {displayStock}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || displayStock === 0}
                  className="flex-1 max-w-[200px] h-12 border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCart size={18} />
                  {isAddingToCart ? 'Menambahkan...' : 'Masukkan Keranjang'}
                </button>
                <button
                  className="flex-1 max-w-[200px] h-12 bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                  disabled={displayStock === 0}
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Store Card */}
        {product.stores && (
          <div className="bg-white p-4 mt-4">
            <Link
              href={`/store/${product.stores.slug}`}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                <Store size={24} className="text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-primary">{product.stores.name}</span>
                  {product.stores.is_verified && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5">✓ Verified</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={12} />
                  <span>{product.stores.city}</span>
                </div>
              </div>
              <button className="px-4 py-2 border border-primary text-primary text-sm hover:bg-primary/5">
                Kunjungi Toko
              </button>
            </Link>
          </div>
        )}

        {/* Product Description */}
        <div className="bg-white p-4 mt-4">
          <h2 className="text-lg font-medium text-primary mb-4 pb-3 border-b">Deskripsi Produk</h2>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {product.description || 'Tidak ada deskripsi untuk produk ini.'}
          </div>
        </div>

        {/* Product Specifications */}
        <div className="bg-white p-4 mt-4 mb-8">
          <h2 className="text-lg font-medium text-primary mb-4 pb-3 border-b">Spesifikasi Produk</h2>
          <table className="w-full text-sm">
            <tbody>
              {product.brand && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 w-40">Merek</td>
                  <td className="py-2 text-gray-700">{product.brand}</td>
                </tr>
              )}
              {product.condition && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 w-40">Kondisi</td>
                  <td className="py-2 text-gray-700 capitalize">{product.condition}</td>
                </tr>
              )}
              {product.weight_grams && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 w-40">Berat</td>
                  <td className="py-2 text-gray-700">{product.weight_grams} gram</td>
                </tr>
              )}
              <tr className="border-b border-gray-100">
                <td className="py-2 text-gray-500 w-40">Stok</td>
                <td className="py-2 text-gray-700">{displayStock}</td>
              </tr>
              {product.sku && (
                <tr className="border-b border-gray-100">
                  <td className="py-2 text-gray-500 w-40">SKU</td>
                  <td className="py-2 text-gray-700">{product.sku}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
