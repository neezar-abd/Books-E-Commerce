'use client';

import React, { useState, useEffect } from 'react';
import { Truck, CreditCard, Headphones, User, ChevronDown, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { profileService } from '@/lib/profile';
import { authService } from '@/lib/auth';
import { orderService } from '@/lib/orders';
import { supabase } from '@/lib/supabase';

type TabType = 'personal' | 'orders' | 'address' | 'payment' | 'password' | 'logout';

interface Profile {
  firstName: string;
  lastName: string;
  phone: string;
  avatar_url: string | null;
}

const MyAccount: React.FC = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile data
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // Orders data
  const [orders, setOrders] = useState<any[]>([]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/sign-in?redirect=/my-account');
        return;
      }

      // Load profile
      const profileData = await profileService.getProfile();
      const userEmail = await profileService.getUserEmail();
      
      setProfile(profileData);
      setEmail(userEmail || '');
      setFormData({
        firstName: profileData?.firstName || '',
        lastName: profileData?.lastName || '',
        phone: profileData?.phone || '',
      });

      // Load orders
      const ordersData = await orderService.getUserOrders();
      setOrders(ordersData || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await profileService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      
      alert('Profil berhasil diperbarui!');
      await loadProfile(); // Refresh data
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data akun...</p>
        </div>
      </div>
    );
  }

  const addresses = [
    {
      id: 1,
      name: 'Bessie Cooper',
      address: '2494 Royal Ln. Mesa, New Jersey 45463'
    },
    {
      id: 2,
      name: 'Bessie Cooper',
      address: '6391 Elgin St. Celina, Delaware 10299'
    }
  ];

  const renderPersonalInfo = () => (
    <div className="flex gap-8">
      {/* Profile Picture */}
      <div className="flex-shrink-0">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-primary flex items-center justify-center text-white text-3xl font-bold">
                {formData.firstName?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-opacity-90">
            <Edit size={18} />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1">
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Nama Belakang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="bg-primary text-white px-10 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? 'Menyimpan...' : 'Perbarui Perubahan'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Pesanan ({orders.length})</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Urutkan berdasarkan:</span>
          <div className="relative">
            <select className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary appearance-none pr-10">
              <option>Semua</option>
              <option>Terbaru</option>
              <option>Terlama</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="border-2 border-gray-200 rounded-2xl p-6">
            {/* Order Header */}
            <div className="bg-secondary rounded-xl p-4 mb-4 grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-primary/70 mb-1">ID Pesanan</p>
                <p className="font-bold text-primary">{order.order_number}</p>
              </div>
              <div>
                <p className="text-sm text-primary/70 mb-1">Total Pembayaran</p>
                <p className="font-bold text-primary">{formatRupiah(order.total)}</p>
              </div>
              <div>
                <p className="text-sm text-primary/70 mb-1">Metode Pembayaran</p>
                <p className="font-bold text-primary">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-sm text-primary/70 mb-1">
                  {order.status === 'completed' ? 'Tanggal Diterima' : 'Estimasi Pengiriman'}
                </p>
                <p className="font-bold text-primary">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3 mb-4">
              {order.order_items && order.order_items.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-4">
                  {item.product_image && (
                    <img
                      src={item.product_image}
                      alt={item.product_title}
                      className="w-16 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="font-bold text-primary">{item.product_title}</h4>
                    <p className="text-sm text-gray-500">{item.quantity} Qty. - {formatRupiah(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span
                  className={`px-4 py-1 rounded-full text-sm font-bold ${
                    order.status === 'completed'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-secondary text-primary'
                  }`}
                >
                  {order.status === 'completed' ? 'Terkirim' : 'Diproses'}
                </span>
                <span className="text-gray-600">
                  {order.status === 'completed'
                    ? 'Pesanan Anda telah Terkirim'
                    : 'Pesanan Anda sedang Diproses'}
                </span>
              </div>
              <div className="flex gap-3">
                {order.status === 'completed' ? (
                  <button className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90">
                    Tambah Review
                  </button>
                ) : (
                  <button 
                    onClick={() => router.push(`/track-order?order_id=${order.id}`)}
                    className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-opacity-90"
                  >
                    Lacak Pesanan
                  </button>
                )}
                <button className="border-2 border-gray-300 text-primary px-6 py-2 rounded-full font-bold hover:border-primary">
                  Invoice
                </button>
                {order.status !== 'completed' && (
                  <button className="text-red-500 font-bold hover:text-red-600">
                    Batalkan Pesanan
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderManageAddress = () => (
    <div>
      {/* Saved Addresses */}
      <div className="space-y-4 mb-8">
        {addresses.map((address) => (
          <div key={address.id} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl">
            <div>
              <h3 className="font-bold text-primary mb-1">{address.name}</h3>
              <p className="text-gray-600">{address.address}</p>
            </div>
            <div className="flex gap-3">
              <button className="text-primary font-bold hover:text-secondary">Edit</button>
              <button className="text-red-500 font-bold hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Address Form */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Tambah Alamat Baru</h2>
        
        <form className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Nama Depan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: John"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Nama Belakang <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Doe"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Nama Perusahaan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Masukkan Nama Perusahaan"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Negara <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none">
                <option>Pilih Negara</option>
                <option>Indonesia</option>
                <option>Malaysia</option>
                <option>Singapore</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Alamat Jalan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan Alamat Jalan"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Kota <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none">
                  <option>Pilih Kota</option>
                  <option>Jakarta</option>
                  <option>Bandung</option>
                  <option>Surabaya</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Provinsi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none">
                  <option>Pilih Provinsi</option>
                  <option>DKI Jakarta</option>
                  <option>Jawa Barat</option>
                  <option>Jawa Timur</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Kode Pos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan Kode Pos"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Telepon <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              placeholder="Masukkan Nomor Telepon"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Masukkan Alamat Email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            className="bg-primary text-white px-10 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all"
          >
            Tambah Alamat
          </button>
        </form>
      </div>
    </div>
  );

  const renderPaymentMethod = () => (
    <div>
      {/* Saved Payment Methods */}
      <div className="space-y-4 mb-8">
        {/* PayPal */}
        <div className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-600">PayPal</div>
          </div>
          <button className="text-primary font-bold hover:text-secondary">Link Account</button>
        </div>

        {/* Visa Card */}
        <div className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-blue-700">VISA</div>
            <span className="text-gray-600">**** **** **** 8047</span>
          </div>
          <button className="text-red-500 font-bold hover:text-red-600">Delete</button>
        </div>

        {/* Google Pay */}
        <div className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold">Google Pay</div>
          </div>
          <button className="text-primary font-bold hover:text-secondary">Link Account</button>
        </div>
      </div>

      {/* Add New Card Form */}
      <div className="border-t-2 border-gray-200 pt-8">
        <h2 className="text-2xl font-bold text-primary mb-6">Tambah Kartu Kredit/Debit Baru</h2>
        
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Nama Pemegang Kartu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: John Doe"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-primary mb-2">
              Nomor Kartu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="4716 9627 1635 8047"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Tanggal Kadaluarsa <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="02/30"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                CVV <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="w-5 h-5 bg-primary rounded border-2 border-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm text-primary">Simpan kartu untuk pembayaran di masa depan</span>
          </label>

          <button
            type="submit"
            className="bg-primary text-white px-10 py-3 rounded-full font-bold hover:bg-opacity-90 transition-all"
          >
            Tambah Kartu
          </button>
        </form>
      </div>
    </div>
  );

  const renderLogout = () => (
    <div className="text-center py-12">
      <h2 className="text-2xl font-bold text-primary mb-4">Keluar</h2>
      <p className="text-gray-600 mb-8">Apakah Anda yakin ingin keluar dari akun Anda?</p>
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setActiveTab('personal')}
          className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-full font-bold hover:border-primary hover:text-primary transition-all"
        >
          Batal
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-10 py-3 rounded-full font-bold hover:bg-red-600 transition-all"
        >
          Ya, Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Akun Saya</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-8">Akun Saya</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full px-6 py-4 text-left font-bold transition-colors ${
                  activeTab === 'personal' ? 'bg-secondary text-primary' : 'text-gray-600 hover:bg-surface'
                }`}
              >
                Informasi Personal
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full px-6 py-4 text-left font-bold transition-colors ${
                  activeTab === 'orders' ? 'bg-secondary text-primary' : 'text-gray-600 hover:bg-surface'
                }`}
              >
                Pesanan Saya
              </button>
              <button
                onClick={() => setActiveTab('address')}
                className={`w-full px-6 py-4 text-left font-bold transition-colors ${
                  activeTab === 'address' ? 'bg-secondary text-primary' : 'text-gray-600 hover:bg-surface'
                }`}
              >
                Kelola Alamat
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full px-6 py-4 text-left font-bold transition-colors ${
                  activeTab === 'payment' ? 'bg-secondary text-primary' : 'text-gray-600 hover:bg-surface'
                }`}
              >
                Metode Pembayaran
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`w-full px-6 py-4 text-left font-bold transition-colors ${
                  activeTab === 'password' ? 'bg-secondary text-primary' : 'text-gray-600 hover:bg-surface'
                }`}
              >
                Kelola Password
              </button>
              <button
                onClick={() => setActiveTab('logout')}
                className={`w-full px-6 py-4 text-left font-bold transition-colors ${
                  activeTab === 'logout' ? 'bg-secondary text-primary' : 'text-red-500 hover:bg-red-50'
                }`}
              >
                Keluar
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              {activeTab === 'personal' && renderPersonalInfo()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'address' && renderManageAddress()}
              {activeTab === 'payment' && renderPaymentMethod()}
              {activeTab === 'password' && (
                <div className="text-center py-12 text-gray-500">
                  Konten Kelola Password akan ditambahkan
                </div>
              )}
              {activeTab === 'logout' && renderLogout()}
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

export default MyAccount;
