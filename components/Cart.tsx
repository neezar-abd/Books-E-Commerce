'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Truck, CreditCard, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { cartService } from '@/lib/cart';
import { supabase } from '@/lib/supabase';

interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: {
    id: string;
    title: string;
    price: number;
    image: string;
    stock: number;
  };
}

const Cart: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);

  // Load cart items on mount
  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/sign-in?redirect=/cart');
        return;
      }

      const data = await cartService.getCartItems();
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      alert('Gagal memuat keranjang belanja');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.products?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const shipping = 0;
  const taxes = 0;
  const total = subtotal + shipping + taxes - discount;

  const updateQuantity = async (id: string, delta: number) => {
    try {
      setUpdating(id as any);
      const item = cartItems.find(i => i.id === id);
      if (!item) return;

      const newQuantity = Math.max(1, item.quantity + delta);
      await cartService.updateQuantity(id, newQuantity);
      
      setCartItems(items =>
        items.map(i => i.id === id ? { ...i, quantity: newQuantity } : i)
      );

      // Notify header to update count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Gagal memperbarui jumlah');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (id: string) => {
    try {
      const item = cartItems.find(i => i.id === id);
      if (!item) return;

      await cartService.removeFromCart(id);
      setCartItems(items => items.filter(i => i.id !== id));
      
      // Notify header to update count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Gagal menghapus item');
    }
  };

  const clearCart = async () => {
    if (!confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) return;

    try {
      await cartService.clearCart();
      setCartItems([]);
      setAppliedCoupon(null);
      setDiscount(0);

      // Notify header to update count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Gagal mengosongkan keranjang');
    }
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'SAVE100K') {
      setDiscount(100000);
      setAppliedCoupon(couponCode);
      setCouponCode('');
    } else if (couponCode) {
      alert('Kode kupon tidak valid');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Keranjang Belanja</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-8">Keranjang Belanja</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Cart Items */}
          <div className="lg:col-span-2">
            
            {/* Table Header */}
            <div className="bg-secondary rounded-t-2xl px-6 py-4 grid grid-cols-12 gap-4 font-bold text-primary">
              <div className="col-span-5">Produk</div>
              <div className="col-span-2 text-center">Harga</div>
              <div className="col-span-2 text-center">Jumlah</div>
              <div className="col-span-3 text-center">Subtotal</div>
            </div>

            {/* Cart Items */}
            <div className="bg-white border-x border-b border-gray-200 rounded-b-2xl divide-y divide-gray-200">
              {cartItems.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 mb-4">Keranjang belanja Anda kosong</p>
                  <Link href="/" className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-opacity-90 inline-block">
                    Mulai Belanja
                  </Link>
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="p-6 grid grid-cols-12 gap-4 items-center">
                    
                    {/* Remove Button & Product Info */}
                    <div className="col-span-5 flex items-center gap-4">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-red-500 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <X size={16} />
                      </button>
                      <img
                        src={item.products?.image || 'https://via.placeholder.com/80x96'}
                        alt={item.products?.title || 'Product'}
                        className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-primary mb-1">{item.products?.title || 'Unknown Product'}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center">
                      <span className="font-bold text-primary">{formatRupiah(item.products?.price || 0)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center border-2 border-gray-300 rounded-full overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={updating === item.id}
                          className="w-10 h-10 flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={updating === item.id}
                          className="w-10 h-10 flex items-center justify-center hover:bg-surface transition-colors disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-3 text-center">
                      <span className="font-bold text-primary text-lg">{formatRupiah((item.products?.price || 0) * item.quantity)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Coupon & Clear Cart */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex gap-3 flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Kode Kupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition-all"
                >
                  Terapkan Kupon
                </button>
              </div>
              <button
                onClick={clearCart}
                className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-medium hover:border-primary hover:text-primary transition-all"
              >
                Kosongkan Keranjang
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-primary mb-6">Ringkasan Pesanan</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Items</span>
                  <span className="font-bold text-primary">{cartItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sub Total</span>
                  <span className="font-bold text-primary">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pengiriman</span>
                  <span className="font-bold text-primary">{formatRupiah(shipping)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pajak</span>
                  <span className="font-bold text-primary">{formatRupiah(taxes)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Diskon Kupon</span>
                    <span className="font-bold">-{formatRupiah(discount)}</span>
                  </div>
                )}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">Total</span>
                    <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-primary text-white text-center py-4 rounded-full font-bold hover:bg-opacity-90 transition-all mb-4"
              >
                Lanjutkan ke Checkout
              </Link>

              <Link
                href="/"
                className="block w-full border-2 border-primary text-primary text-center py-4 rounded-full font-bold hover:bg-primary hover:text-white transition-all"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Truck size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Gratis Ongkir</h3>
              <p className="text-sm text-gray-600">Gratis ongkir untuk pesanan di atas Rp 500.000</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Pembayaran Fleksibel</h3>
              <p className="text-sm text-gray-600">Berbagai opsi pembayaran yang aman</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Headphones size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Layanan 24/7</h3>
              <p className="text-sm text-gray-600">Kami support online setiap hari</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
