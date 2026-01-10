'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Share2, Check, Truck, Shield, RotateCcw, Loader2, Store, Package, MapPin, Calendar } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { cartService } from '@/lib/cart';
import { supabase } from '@/lib/supabase';
import { browsingHistory } from '@/lib/browsing-history';
import { getProductVariants, getProductCombinations, ProductVariant, VariantCombination } from '@/lib/product-variants';
import { getProductShipping, ShippingOption } from '@/lib/shipping';

interface Product {
  id: string;
  title: string;
  brand?: string;
  sku?: string;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  condition?: string;
  origin_country?: string;
  warranty_type?: string;
  warranty_period?: string;
  gtin?: string;
  min_purchase?: number;
  max_purchase?: number;
  video_url?: string;
  price: number;
  original_price?: number;
  stock: number;
  rating?: number;
  description: string;
  image: string;
  images?: string[];
  category_id?: string;
  store_id?: string;
  stores?: {
    name: string;
    slug: string;
    city: string;
    is_verified: boolean;
  };
}

// Custom interface for transformed combinations
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

// Using types from imports

const ProductDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  // Product State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Variants State
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [combinations, setCombinations] = useState<TransformedCombination[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedCombination, setSelectedCombination] = useState<TransformedCombination | null>(null);

  // Shipping State
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  // UI State
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchProductData();
  }, [params?.id]);

  // Update selected combination when variants change
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

      // Fetch product
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

      // Track browsing history
      if (productData.id && productData.category_id) {
        browsingHistory.addProduct(productData.id, productData.category_id);
      }

      // Fetch variants
      const variantsData = await getProductVariants(productId);
      setVariants(variantsData);

      // Fetch combinations
      const combinationsData = await getProductCombinations(productId);
      // Transform combination format
      const transformedCombinations = combinationsData.map(c => ({
        ...c,
        combination: c.combination.reduce((acc, item) => ({
          ...acc,
          [item.type]: item.value
        }), {} as Record<string, string>)
      }));
      setCombinations(transformedCombinations);

      // Initialize selected variants if combinations exist
      if (transformedCombinations.length > 0) {
        const firstCombo = transformedCombinations[0];
        setSelectedVariants(firstCombo.combination);
        setSelectedCombination(firstCombo);
      }

      // Fetch shipping options
      const shippingData = await getProductShipping(productId);
      setShippingOptions(shippingData);
      if (shippingData.length > 0) {
        setSelectedShipping(shippingData[0]);
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

  const getShippingCost = (): number => {
    if (!selectedShipping || !product?.weight_grams) return 0;

    // Calculate shipping cost
    let price = selectedShipping.base_price;
    if (selectedShipping.per_kg_price) {
      const kg = product.weight_grams / 1000;
      price += selectedShipping.per_kg_price * kg;
    }
    return Math.round(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Produk tidak ditemukan'}</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-primary text-white px-6 py-2 rounded-lg"
          >
            Kembali ke Produk
          </button>
        </div>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - getDisplayPrice()) / product.original_price) * 100)
    : 0;

  const allImages = product.images && product.images.length > 0
    ? product.images
    : [product.image];

  const displayStock = getDisplayStock();
  const minPurchase = product.min_purchase || 1;
  const maxPurchase = product.max_purchase || displayStock;

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:text-primary">Produk</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">{product.title}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Left: Images & Video */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-surface rounded-3xl overflow-hidden">
              <img
                src={allImages[currentImageIndex]}
                alt={product.title}
                className="w-full h-[500px] object-cover"
              />

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-secondary text-primary px-4 py-2 rounded-full font-bold text-sm">
                  -{discount}%
                </div>
              )}

              {/* Image Navigation */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-primary' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 ${idx === currentImageIndex ? 'border-primary' : 'border-gray-200'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {product.video_url && (
              <div className="rounded-3xl overflow-hidden">
                <video
                  src={product.video_url}
                  controls
                  className="w-full"
                  poster={product.image}
                />
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Store Info */}
            {product.stores && (
              <Link
                href={`/store/${product.stores.slug}`}
                className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Store size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">{product.stores.name}</span>
                {product.stores.is_verified && (
                  <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">✓ Verified</span>
                )}
              </Link>
            )}

            {/* Title & Brand */}
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">{product.title}</h1>
              {product.brand && (
                <p className="text-lg text-muted">Brand: <span className="font-semibold text-primary">{product.brand}</span></p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(product.rating || 4.5) ? "fill-secondary text-secondary" : "text-gray-300"} />
                ))}
                <span className="ml-2 font-bold text-primary">{product.rating || '4.5'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">{formatRupiah(getDisplayPrice())}</span>
              {product.original_price && (
                <span className="text-2xl text-gray-400 line-through">{formatRupiah(product.original_price)}</span>
              )}
            </div>

            {/* Condition */}
            {product.condition && (
              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Kondisi: <span className="font-medium text-primary capitalize">{product.condition}</span>
                </span>
              </div>
            )}

            {/* Variants */}
            {getVariantTypes().length > 0 && (
              <div className="space-y-4">
                {getVariantTypes().map(type => (
                  <div key={type}>
                    <label className="text-sm font-semibold text-primary mb-3 block">
                      Pilih {type}:
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {getVariantValues(type).map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => handleVariantSelect(type, variant.variant_value)}
                          className={`px-6 py-3 rounded-full border-2 font-medium transition-all ${selectedVariants[type] === variant.variant_value
                            ? 'border-primary bg-primary text-white'
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

            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-primary">Jumlah:</label>
              <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(minPurchase, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxPurchase, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Stok: {displayStock}
                {minPurchase > 1 && <span className="ml-2">(Min: {minPurchase})</span>}
                {maxPurchase < displayStock && <span className="ml-2">(Max: {maxPurchase})</span>}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || displayStock === 0}
                className="flex-1 bg-primary text-white py-4 rounded-full font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCart size={20} />
                {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </button>
              <button className="flex-1 bg-secondary text-primary py-4 rounded-full font-bold hover:bg-opacity-90 transition-all">
                Beli Sekarang
              </button>
              <button className="w-14 h-14 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-primary hover:text-primary transition-all flex-shrink-0">
                <Heart size={20} />
              </button>
            </div>

            {/* Stock Info */}
            {displayStock > 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={18} />
                <span className="font-medium">Stok Tersedia - Siap Dikirim</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <span className="font-medium">Stok Habis</span>
              </div>
            )}

            {/* Shipping */}
            {shippingOptions.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-primary mb-3">Estimasi Pengiriman</h3>
                <div className="space-y-2">
                  {shippingOptions.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedShipping(option)}
                      className={`w-full text-left p-3 border-2 rounded-lg transition-colors ${selectedShipping?.id === option.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-primary">{option.courier_name} - {option.service_type}</div>
                          <div className="text-xs text-gray-500">{option.estimated_days}</div>
                        </div>
                        <div className="text-sm font-medium text-primary">
                          {formatRupiah((() => {
                            let price = option.base_price;
                            if (option.per_kg_price && product.weight_grams) {
                              const kg = product.weight_grams / 1000;
                              price += option.per_kg_price * kg;
                            }
                            return Math.round(price);
                          })())}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center text-center p-4 bg-surface rounded-2xl">
                <Truck size={24} className="text-primary mb-2" />
                <span className="text-sm font-medium">Gratis Ongkir</span>
                <span className="text-xs text-muted">Min. belanja 500rb</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-surface rounded-2xl">
                <Shield size={24} className="text-primary mb-2" />
                <span className="text-sm font-medium">Pembayaran Aman</span>
                <span className="text-xs text-muted">100% Terlindungi</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-surface rounded-2xl">
                <RotateCcw size={24} className="text-primary mb-2" />
                <span className="text-sm font-medium">Retur Mudah</span>
                <span className="text-xs text-muted">Garansi 30 Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="max-w-6xl mx-auto">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200 mb-8">
            {[
              { key: 'deskripsi', label: 'Deskripsi' },
              { key: 'spesifikasi', label: 'Spesifikasi Lengkap' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-4 font-semibold transition-all ${activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-primary'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-surface rounded-3xl p-8">
            {activeTab === 'deskripsi' && (
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-primary mb-4">Deskripsi</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi untuk produk ini.'}
                </p>
              </div>
            )}

            {activeTab === 'spesifikasi' && (
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6">Spesifikasi Lengkap</h3>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {product.brand && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium w-1/3">Brand</td>
                        <td className="py-4 text-primary font-medium">{product.brand}</td>
                      </tr>
                    )}
                    {product.condition && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Kondisi</td>
                        <td className="py-4 text-primary font-medium capitalize">{product.condition}</td>
                      </tr>
                    )}
                    {product.origin_country && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Negara Asal</td>
                        <td className="py-4 text-primary font-medium">{product.origin_country}</td>
                      </tr>
                    )}
                    {product.weight_grams && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Berat</td>
                        <td className="py-4 text-primary font-medium">{product.weight_grams} gram</td>
                      </tr>
                    )}
                    {(product.length_cm || product.width_cm || product.height_cm) && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Dimensi</td>
                        <td className="py-4 text-primary font-medium">
                          {product.length_cm} cm × {product.width_cm} cm × {product.height_cm} cm
                        </td>
                      </tr>
                    )}
                    {product.warranty_type && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Garansi</td>
                        <td className="py-4 text-primary font-medium">
                          {product.warranty_type} - {product.warranty_period}
                        </td>
                      </tr>
                    )}
                    {product.gtin && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">GTIN / Barcode</td>
                        <td className="py-4 text-primary font-medium">{product.gtin}</td>
                      </tr>
                    )}
                    {product.sku && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">SKU</td>
                        <td className="py-4 text-primary font-medium">{product.sku}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Stok</td>
                      <td className="py-4 text-primary font-medium">{displayStock} unit</td>
                    </tr>
                    {product.stores && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">Toko</td>
                        <td className="py-4 text-primary font-medium">{product.stores.name}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
