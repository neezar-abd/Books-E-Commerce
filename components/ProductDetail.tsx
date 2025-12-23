'use client';

import React, { useState } from 'react';
import { Star, Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { cartService } from '@/lib/cart';

interface ProductDetailProps {
  product?: {
    id: number;
    title: string;
    author: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    description: string;
    images: string[];
    formats: string[];
    inStock: boolean;
    isbn: string;
    publisher: string;
    pages: number;
    language: string;
    publishDate: string;
    dimensions: string;
  };
}

const ProductDetail: React.FC<ProductDetailProps> = ({ product }) => {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState('Hardcover');
  const [activeTab, setActiveTab] = useState('deskripsi');
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      // Add to cart using cartService
      // For now, just show alert as we need user authentication
      alert(`Ditambahkan ke keranjang: ${quantity} x ${currentProduct.title}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Default product data (for demo)
  const defaultProduct = {
    id: 1,
    title: "Gema yang Sunyi",
    author: "oleh Sarah Mitchell",
    price: 350000,
    originalPrice: 450000,
    rating: 4.9,
    reviews: 248,
    description: "Kisah memikat tentang misteri dan penebusan yang berlatar di jantung kota Tokyo modern. Ikuti perjalanan seorang detektif muda saat ia mengungkap rahasia kota yang sunyi, di mana setiap gema menceritakan kisah dan setiap bayangan menyembunyikan kebenaran.",
    images: [
      "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    ],
    formats: ['Hardcover', 'Paperback', 'eBook'],
    inStock: true,
    isbn: '978-0-123456-78-9',
    publisher: 'Penerbit Uchinaga Books',
    pages: 342,
    language: 'Indonesia',
    publishDate: '15 Maret 2024',
    dimensions: '15 x 23 x 3 cm',
  };

  const currentProduct = product || defaultProduct;
  const discount = Math.round(((currentProduct.originalPrice - currentProduct.price) / currentProduct.originalPrice) * 100);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? currentProduct.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === currentProduct.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <span className="hover:text-primary cursor-pointer">Beranda</span>
          <span className="mx-2">/</span>
          <span className="hover:text-primary cursor-pointer">Buku</span>
          <span className="mx-2">/</span>
          <span className="hover:text-primary cursor-pointer">Fiksi</span>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Detail Produk</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          
          {/* Left: Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-surface rounded-3xl overflow-hidden group">
              <img 
                src={currentProduct.images[selectedImage]} 
                alt={currentProduct.title}
                className="w-full h-[500px] object-cover"
              />
              
              {/* Navigation Arrows */}
              <button 
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
              >
                <ChevronRight size={24} />
              </button>

              {/* Discount Badge */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-secondary text-primary px-4 py-2 rounded-full font-bold text-sm">
                  -{discount}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-3">
              {currentProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-24 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 bg-lightGreen px-3 py-1 rounded-full">
              <span className="text-sm font-semibold text-primary">Fiksi</span>
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">{currentProduct.title}</h1>
              <p className="text-lg text-muted">{currentProduct.author}</p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < Math.floor(currentProduct.rating) ? "fill-secondary text-secondary" : "text-gray-300"} />
                ))}
                <span className="ml-2 font-bold text-primary">{currentProduct.rating}</span>
              </div>
              <span className="text-muted">({currentProduct.reviews} Ulasan)</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-primary">{formatRupiah(currentProduct.price)}</span>
              <span className="text-2xl text-gray-400 line-through">{formatRupiah(currentProduct.originalPrice)}</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{currentProduct.description}</p>

            {/* Format Selector */}
            <div>
              <label className="text-sm font-semibold text-primary mb-3 block">Format:</label>
              <div className="flex gap-3">
                {currentProduct.formats.map((format) => (
                  <button
                    key={format}
                    onClick={() => setSelectedFormat(format)}
                    className={`px-6 py-3 rounded-full border-2 font-medium transition-all ${
                      selectedFormat === format
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
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 flex items-center justify-center hover:bg-surface transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
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
            <div className="flex items-center gap-2 text-green-600">
              <Check size={18} />
              <span className="font-medium">Stok Tersedia - Siap Dikirim</span>
            </div>

            {/* Product Meta */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium text-primary">{currentProduct.isbn}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Kategori:</span>
                <span className="font-medium text-primary">Fiksi, Misteri, Thriller</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tag:</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-surface rounded-full text-sm">Terlaris</span>
                  <span className="px-3 py-1 bg-surface rounded-full text-sm">Pemenang Award</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-4 pt-4">
              <span className="text-gray-600 font-medium">Bagikan:</span>
              <div className="flex gap-2">
                {['whatsapp', 'email'].map((social) => (
                  <button key={social} className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all">
                    <Share2 size={16} />
                  </button>
                ))}
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
            {[{ key: 'deskripsi', label: 'Deskripsi' }, { key: 'detail', label: 'Informasi Tambahan' }, { key: 'ulasan', label: 'Ulasan' }].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-8 py-4 font-semibold transition-all ${
                  activeTab === tab.key
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
                <p className="text-gray-700 leading-relaxed">
                  {currentProduct.description}
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Novel memikat ini membawa pembaca dalam perjalanan tak terlupakan melalui jalanan Tokyo yang ramai, 
                  di mana tradisi kuno bertemu dengan modernitas mutakhir. Melalui prosa yang hidup dan pengembangan karakter yang rumit, 
                  penulis merangkai kisah yang mengeksplorasi tema identitas, kehilangan, dan penebusan.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Sempurna untuk penggemar fiksi sastra dan thriller misteri, "Gema yang Sunyi" telah dipuji oleh kritikus 
                  dan pembaca karena narasi atmosferik dan alur cerita yang menarik.
                </p>
              </div>
            )}

            {activeTab === 'detail' && (
              <div>
                <h3 className="text-2xl font-bold text-primary mb-6">Informasi Tambahan</h3>
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-4 text-gray-600 font-medium w-1/3">ISBN</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.isbn}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Penerbit</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.publisher}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Halaman</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.pages} halaman</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Bahasa</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.language}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Tanggal Terbit</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.publishDate}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Dimensi</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.dimensions}</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-600 font-medium">Format Tersedia</td>
                      <td className="py-4 text-primary font-medium">{currentProduct.formats.join(', ')}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'ulasan' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-primary mb-6">Ulasan Pelanggan ({currentProduct.reviews})</h3>
                
                {/* Review Summary */}
                <div className="flex items-center gap-8 pb-6 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary mb-2">{currentProduct.rating}</div>
                    <div className="flex justify-center mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < Math.floor(currentProduct.rating) ? "fill-secondary text-secondary" : "text-gray-300"} />
                      ))}
                    </div>
                    <div className="text-sm text-muted">{currentProduct.reviews} ulasan</div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 w-16">{stars} bintang</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-secondary" style={{ width: `${stars === 5 ? 80 : stars === 4 ? 15 : 5}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">{stars === 5 ? 80 : stars === 4 ? 15 : 5}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Individual Reviews */}
                {[1, 2, 3].map((review) => (
                  <div key={review} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start gap-4">
                      <img 
                        src={`https://randomuser.me/api/portraits/women/${40 + review}.jpg`}
                        className="w-12 h-12 rounded-full"
                        alt="Pembeli"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-bold text-primary">Siti Rahmawati</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={14} className="fill-secondary text-secondary" />
                                ))}
                              </div>
                              <span className="text-sm text-muted">2 hari lalu</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          Sangat suka buku ini! Cara berceritanya luar biasa dan karakternya sangat berkembang dengan baik. 
                          Saya tidak bisa berhenti membaca. Sangat direkomendasikan untuk siapa saja yang menyukai fiksi misteri.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <button className="w-full py-3 border-2 border-primary text-primary rounded-full font-medium hover:bg-primary hover:text-white transition-all">
                  Muat Ulasan Lainnya
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
