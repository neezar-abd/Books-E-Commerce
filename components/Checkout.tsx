'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, Headphones, ChevronDown } from 'lucide-react';
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

const Checkout: React.FC = () => {
  const router = useRouter();
  const [deliveryOption, setDeliveryOption] = useState<'same' | 'different'>('same');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    country: 'Indonesia',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    phone: '',
    email: ''
  });

  const SHIPPING_COST = 100000;
  const TAX_RATE = 0.1;

  // Province to Cities mapping
  const provinceCitiesMap: { [key: string]: string[] } = {
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Barat', 'Jakarta Timur'],
    'Jawa Barat': ['Bandung', 'Bogor', 'Bekasi', 'Depok', 'Cirebon', 'Sukabumi', 'Tasikmalaya', 'Cimahi'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Probolinggo', 'Pasuruan', 'Kediri', 'Blitar', 'Madiun', 'Mojokerto'],
    'Jawa Tengah': ['Semarang', 'Solo', 'Magelang', 'Salatiga', 'Pekalongan', 'Tegal'],
    'DI Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunung Kidul'],
    'Bali': ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Klungkung'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Tebing Tinggi', 'Pematang Siantar'],
    'Sumatera Barat': ['Padang', 'Bukittinggi', 'Payakumbuh', 'Solok']
  };

  const provinces = Object.keys(provinceCitiesMap);
  const availableCities = formData.province ? provinceCitiesMap[formData.province] || [] : [];

  const handleProvinceChange = (selectedProvince: string) => {
    setFormData({
      ...formData,
      province: selectedProvince,
      city: '' // Reset city when province changes
    });
  };

  // Load cart items and user data
  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/sign-in?redirect=/checkout');
          return;
        }

        // Fetch cart items
        const data = await cartService.getCartItems();
        setCartItems(data || []);

        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setFormData(prev => ({
            ...prev,
            firstName: profile.full_name?.split(' ')[0] || '',
            lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
            phone: profile.phone || ''
          }));
        }
        setFormData(prev => ({
          ...prev,
          email: user.email || ''
        }));
      } catch (error) {
        console.error('Error loading checkout:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, [router]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.products?.price || 0;
    return sum + (price * item.quantity);
  }, 0);
  const taxes = Math.round(subtotal * TAX_RATE);
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + SHIPPING_COST + taxes - discount;

  // Sample coupon codes (dapat diganti dengan API call ke backend)
  const validCoupons: { [key: string]: number } = {
    'WELCOME20': 50000,
    'BOOKLOVERS': 75000,
    'SAVE10': 100000,
    'UCHINAGA2024': 150000
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      alert('Mohon masukkan kode kupon');
      return;
    }

    const upperCode = couponCode.toUpperCase();
    if (validCoupons[upperCode]) {
      setAppliedCoupon({
        code: upperCode,
        discount: validCoupons[upperCode]
      });
      alert(`Kupon "${upperCode}" berhasil diterapkan! Diskon: Rp ${validCoupons[upperCode].toLocaleString('id-ID')}`);
    } else {
      alert('Kode kupon tidak valid');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.province || !formData.zipCode || !formData.phone || !formData.email) {
        alert('Mohon lengkapi semua field yang wajib diisi');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in');
        return;
      }

      setLoading(true);

      // Create order items array
      const orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        product_title: item.products?.title || 'Unknown',
        product_image: item.products?.image,
        price: item.products?.price || 0,
        quantity: item.quantity,
        subtotal: (item.products?.price || 0) * item.quantity
      }));

      // Call API route to create order with email notifications
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          order_number: `ORD-${Date.now()}`,
          subtotal: subtotal,
          shipping_cost: SHIPPING_COST,
          tax: taxes,
          discount: discount,
          total: total,
          payment_method: 'QRIS',
          shipping_address: {
            recipient_name: `${formData.firstName} ${formData.lastName}`,
            recipient_phone: formData.phone,
            address: formData.address,
            city: formData.city,
            province: formData.province,
            postal_code: formData.zipCode,
            email: formData.email
          },
          order_items: orderItems
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Gagal membuat pesanan');
      }

      const result = await response.json();
      // Redirect to payment
      router.push(`/checkout?step=payment&orderId=${result.orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      alert(error instanceof Error ? error.message : 'Gagal membuat pesanan. Mohon coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <Link href="/cart" className="hover:text-primary">Keranjang Belanja</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Checkout</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-8">Checkout</h1>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <p className="text-gray-500">Loading checkout...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
            {/* Billing Details */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-primary mb-6">Detail Penagihan</h2>
                
                <form className="space-y-5">
                  {/* Name Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">
                        Nama Depan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">
                        Nama Belakang <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Nama Perusahaan (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan Nama Perusahaan"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Negara <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select 
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none"
                      >
                        <option>Indonesia</option>
                        <option>Malaysia</option>
                        <option>Singapore</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Alamat Jalan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan Alamat Jalan"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">
                        Provinsi <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formData.province}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none"
                          required
                        >
                          <option value="">Pilih Provinsi</option>
                          {provinces.map(province => (
                            <option key={province} value={province}>{province}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">
                        Kota <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select 
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                          required
                          disabled={!formData.province}
                        >
                          <option value="">
                            {formData.province ? 'Pilih Kota' : 'Pilih Provinsi Dulu'}
                          </option>
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                      </div>
                    </div>
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-bold text-primary mb-2">
                      Kode Pos <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Masukkan Kode Pos"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="Masukkan Nomor Telepon"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Masukkan Alamat Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-sm font-bold text-primary mb-3">
                    Alamat Pengiriman <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryOption === 'same'}
                          onChange={() => setDeliveryOption('same')}
                          className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-full checked:border-primary checked:border-[6px] transition-all"
                        />
                      </div>
                      <span className="text-primary">Sama dengan alamat pengiriman</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="radio"
                          name="delivery"
                          checked={deliveryOption === 'different'}
                          onChange={() => setDeliveryOption('different')}
                          className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-full checked:border-primary checked:border-[6px] transition-all"
                        />
                      </div>
                      <span className="text-primary">Gunakan alamat penagihan yang berbeda</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-primary mb-6">Ringkasan Pesanan</h2>
                
                {/* Coupon Section */}
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-bold text-primary mb-2">Kode Kupon (Opsional)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan kode kupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={appliedCoupon !== null}
                      className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary disabled:bg-gray-100"
                    />
                    {!appliedCoupon ? (
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-colors"
                      >
                        Terapkan
                      </button>
                    ) : (
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-green-600 mt-2">✓ Kupon "{appliedCoupon.code}" diterapkan</p>
                  )}
                </div>
                
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
                    <span className="font-bold text-primary">{formatRupiah(SHIPPING_COST)}</span>
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

                <button 
                  onClick={handleCheckout}
                  className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-opacity-90 transition-all"
                >
                  Lanjutkan ke Pembayaran
                </button>
              </div>
            </div>
          </div>
        )}

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

export default Checkout;
