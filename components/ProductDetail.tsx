'use client';

import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Check, Truck, Shield, RotateCcw, Loader2, Store } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRupiah } from '@/lib/utils';
import { cartService } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

interface Product {
  id: string;
  title: string;
  author: string;
  price: number;
  original_price?: number;
  rating?: number;
  description: string;
  image: string;
  stock: number;
  isbn?: string;
  category_id?: string;
  store_id?: string;
  stores?: {
    name: string;
    slug: string;
    city: string;
    is_verified: boolean;
  };
}

const ProductDetail: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState('Hardcover');
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productId = params?.id as string;
        if (!productId) {
          setError('Product ID not found');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('products')
          .select('*, stores(name, slug, city, is_verified)')
          .eq('id', productId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) {
          setError('Produk tidak ditemukan');
          return;
        }

        setProduct(data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Gagal memuat produk');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params?.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setIsAddingToCart(true);
      await cartService.addItem(product.id, quantity);
      alert(`Ditambahkan ke keranjang: ${quantity} x ${product.title}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang');
    } finally {
      setIsAddingToCart(false);
    }
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
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const images = product.image
    ? [product.image]
    : ['https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

  const formats = ['Hardcover', 'Paperback', 'eBook'];

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

          {/* Left: Image */}
          <div className="space-y-4">
            <div className="relative bg-surface rounded-3xl overflow-hidden">
              <img
                src={images[0]}
                alt={product.title}
                className="w-full h-[500px] object-cover"
              />

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-secondary text-primary px-4 py-2 rounded-full font-bold text-sm">
                  -{discount}%
                </div>
              )}
            </div>
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

            {/* Title & Author */}
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">{product.title}</h1>
              <p className="text-lg text-muted">oleh {product.author}</p>
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
              <span className="text-4xl font-bold text-primary">{formatRupiah(product.price)}</span>
              {product.original_price && (
                <span className="text-2xl text-gray-400 line-through">{formatRupiah(product.original_price)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description || 'Tidak ada deskripsi.'}</p>

            {/* Format Selector */}
            <div>
              <label className="text-sm font-semibold text-primary mb-3 block">Format:</label>
              <div className="flex gap-3">
                {formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-6 py-3 rounded-full border-2 font-medium transition-all ${selectedFormat === format
                        ? 'border-primary bg-primary text-white'
                        : 'border-gray-300 text-gray-700 hover:border-primary'
                      }`}
                  >
                    {format}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-6">
              <label className="text-sm font-semibold text-primary">Jumlah:</label>
              <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">Stok: {product.stock || 0}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.stock === 0}
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
            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check size={18} />
                <span className="font-medium">Stok Tersedia - Siap Dikirim</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <span className="font-medium">Stok Habis</span>
              </div>
            )}

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              {product.isbn && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">ISBN:</span>
                  <span className="font-medium text-primary">{product.isbn}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">ID Produk:</span>
                <span className="font-medium text-primary text-sm">{product.id}</span>
              </div>
            </div>

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
            {[{ key: 'deskripsi', label: 'Deskripsi' }, { key: 'detail', label: 'Informasi Tambahan' }].map((tab) => (
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

            {activeTab === 'detail' && (
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6">Informasi Tambahan</h3>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-4 text-gray-600 font-medium w-1/3">Judul</td>
                      <td className="py-4 text-primary font-medium">{product.title}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Penulis</td>
                      <td className="py-4 text-primary font-medium">{product.author}</td>
                    </tr>
                    {product.isbn && (
                      <tr>
                        <td className="py-4 text-gray-600 font-medium">ISBN</td>
                        <td className="py-4 text-primary font-medium">{product.isbn}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Stok</td>
                      <td className="py-4 text-primary font-medium">{product.stock} unit</td>
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
