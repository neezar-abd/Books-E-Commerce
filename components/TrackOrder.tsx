'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Package, Truck, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  order_items: any[];
}

const TrackOrder: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const getOrderSteps = () => [
    {
      id: 1,
      title: 'Pesanan Ditempatkan',
      icon: ShoppingBag,
      date: order ? new Date(order.created_at).toLocaleDateString('id-ID') : '',
      time: order ? new Date(order.created_at).toLocaleTimeString('id-ID') : '',
      status: order ? 'completed' : 'pending'
    },
    {
      id: 2,
      title: 'Diterima',
      icon: CheckCircle,
      date: order ? new Date(order.created_at).toLocaleDateString('id-ID') : '',
      time: order ? new Date(order.created_at).toLocaleTimeString('id-ID') : '',
      status: ['pending', 'processing'].includes(order?.status || '') ? 'pending' : 'completed'
    },
    {
      id: 3,
      title: 'Dalam Proses',
      icon: Package,
      date: 'Diperkirakan',
      time: order ? new Date(new Date(order.created_at).getTime() + 86400000).toLocaleDateString('id-ID') : '',
      status: ['pending'].includes(order?.status || '') ? 'pending' : 'completed'
    },
    {
      id: 4,
      title: 'Dalam Perjalanan',
      icon: Truck,
      date: 'Diperkirakan',
      time: order ? new Date(new Date(order.created_at).getTime() + 172800000).toLocaleDateString('id-ID') : '',
      status: order?.status === 'completed' ? 'completed' : 'pending'
    },
    {
      id: 5,
      title: 'Terkirim',
      icon: Home,
      date: 'Diperkirakan',
      time: order ? new Date(new Date(order.created_at).getTime() + 259200000).toLocaleDateString('id-ID') : '',
      status: order?.status === 'completed' ? 'completed' : 'pending'
    }
  ];

  const orderSteps = getOrderSteps();

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pesanan tidak ditemukan</p>
          <Link href="/my-account" className="text-primary font-bold hover:text-secondary">
            Kembali ke Pesanan Saya
          </Link>
        </div>
      </div>
    );
  }

  const products = order?.order_items || [];

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container-80">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Lacak Pesanan Anda</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-12 text-center">Lacak Pesanan Anda</h1>

        {/* Order Status */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-primary mb-2">Status Pesanan</h2>
          <p className="text-gray-600 mb-8">ID Pesanan: {order?.order_number}</p>

          {/* Timeline */}
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-10 left-8 right-8 h-1 bg-gray-200 hidden md:block">
              <div className="absolute h-full bg-primary transition-all duration-500" style={{ width: '25%' }} />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative">
              {orderSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex flex-col items-center text-center">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 relative z-10 transition-all ${step.status === 'completed'
                          ? 'bg-secondary'
                          : 'bg-gray-200'
                        }`}
                    >
                      <Icon size={32} className={step.status === 'completed' ? 'text-primary' : 'text-gray-400'} />
                      {step.status === 'completed' && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <CheckCircle size={16} className="text-white" fill="currentColor" />
                        </div>
                      )}
                    </div>
                    <h3 className={`font-bold mb-1 ${step.status === 'completed' ? 'text-primary' : 'text-gray-400'}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">{step.date}</p>
                    <p className="text-sm text-gray-500">{step.time}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-primary mb-6">Produk</h2>

          <div className="space-y-6">
            {products && products.length > 0 ? (
              products.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                  {product.product_image && (
                    <img
                      src={product.product_image}
                      alt={product.product_title}
                      className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-primary mb-1">{product.product_title}</h3>
                    <p className="text-sm text-gray-500">{product.quantity} Qty. - {formatRupiah(product.price)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Tidak ada produk dalam pesanan ini</p>
            )}
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
              <Package size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Pembayaran Fleksibel</h3>
              <p className="text-sm text-gray-600">Berbagai opsi pembayaran yang aman</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle size={28} className="text-primary" />
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

export default TrackOrder;
