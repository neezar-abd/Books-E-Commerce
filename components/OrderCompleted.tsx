'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Truck, CreditCard, Headphones } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatRupiah } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface OrderItem {
  id: string;
  product_title: string;
  product_image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  discount: number;
  total: number;
  status: string;
  shipping_address: {
    recipient_name: string;
  };
}

const OrderCompleted: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        if (!orderId) {
          router.push('/');
          return;
        }

        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError) throw orderError;
        setOrder(orderData);

        // Fetch order items
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error('Error loading order:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, router]);

  const handleDownloadInvoice = () => {
    alert('Invoice download akan diimplementasikan');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pesanan tidak ditemukan</p>
          <Link href="/" className="text-primary font-bold">Kembali ke Beranda</Link>
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
          <span className="text-primary font-medium">Pesanan Selesai</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-2 text-center">Pesanan Selesai</h1>

        {/* Success Icon & Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-full mb-4">
            <CheckCircle size={40} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">Pesanan Anda telah selesai!</h2>
          <p className="text-gray-600">Terima kasih. Pesanan Anda telah diterima.</p>
        </div>

        {/* Order Info Banner */}
        <div className="bg-secondary rounded-2xl p-6 mb-8 grid grid-cols-1 md:grid-cols-5 gap-6">
          <div>
            <p className="text-sm text-primary/70 mb-1">ID Pesanan</p>
            <p className="font-bold text-primary">{order.order_number}</p>
          </div>
          <div>
            <p className="text-sm text-primary/70 mb-1">Metode Pembayaran</p>
            <p className="font-bold text-primary">QRIS</p>
          </div>
          <div>
            <p className="text-sm text-primary/70 mb-1">Status</p>
            <p className="font-bold text-primary capitalize">{order.status}</p>
          </div>
          <div>
            <p className="text-sm text-primary/70 mb-1">Nama Penerima</p>
            <p className="font-bold text-primary">{order.shipping_address.recipient_name}</p>
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleDownloadInvoice}
              className="w-full bg-primary text-white py-3 px-6 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Download Invoice
            </button>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-primary mb-6">Detail Pesanan</h3>
          
          {/* Products Header */}
          <div className="flex justify-between items-center pb-4 border-b-2 border-gray-200 mb-4">
            <span className="font-bold text-primary">Produk</span>
            <span className="font-bold text-primary">Sub Total</span>
          </div>

          {/* Products List */}
          <div className="space-y-4 mb-6">
            {orderItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product_image || 'https://via.placeholder.com/64x80'}
                    alt={item.product_title}
                    className="w-16 h-20 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-bold text-primary">{item.product_title}</h4>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-primary">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t-2 border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pengiriman</span>
              <span className="font-bold text-primary">{formatRupiah(order.shipping_cost)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pajak</span>
              <span className="font-bold text-primary">{formatRupiah(order.tax)}</span>
            </div>
            <div className="flex justify-between items-center text-green-600">
              <span>Diskon Kupon</span>
              <span className="font-bold">-{formatRupiah(order.discount)}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-200">
              <span className="text-xl font-bold text-primary">Total</span>
              <span className="text-2xl font-bold text-primary">{formatRupiah(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

export default OrderCompleted;
