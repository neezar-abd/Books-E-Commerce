'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  shipping_address: {
    recipient_name: string;
    recipient_phone: string;
    address: string;
    city: string;
    province: string;
    postal_code: string;
    email: string;
  };
}

const Payment: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [bankAccount] = useState({
    bank: 'Bank Central Asia (BCA)',
    accountNumber: '1234567890',
    accountName: 'PT ZAREE INDONESIA'
  });

  useEffect(() => {
    const loadOrder = async () => {
      try {
        if (!orderId) {
          router.push('/checkout');
          return;
        }

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (error) throw error;
        setOrder(data);
      } catch (error) {
        console.error('Error loading order:', error);
        router.push('/checkout');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, router]);

  const handleConfirmPayment = async () => {
    try {
      setConfirming(true);

      // Update order status to completed
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId);

      if (error) throw error;

      // Clear cart
      const { data: cartItems } = await supabase
        .from('cart_items')
        .select('id');

      if (cartItems && cartItems.length > 0) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItems[0].id);
      }

      // Redirect to order completed
      router.push(`/order-completed?orderId=${orderId}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('Gagal mengkonfirmasi pembayaran, silakan coba lagi');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Pesanan tidak ditemukan</p>
          <Link href="/checkout" className="text-primary font-bold">Kembali ke Checkout</Link>
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
          <Link href="/cart" className="hover:text-primary">Keranjang Belanja</Link>
          <span className="mx-2">/</span>
          <Link href="/checkout" className="hover:text-primary">Checkout</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Pembayaran</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-8">Pembayaran</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Payment Method */}
          <div className="lg:col-span-2">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-primary mb-6">Metode Pembayaran</h2>

              {/* QRIS */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-primary mb-4">QRIS</h3>
                <div className="bg-surface rounded-2xl p-8 flex flex-col items-center">
                  <img
                    src="/qris.png"
                    alt="QRIS Payment"
                    className="w-64 h-64 object-contain mb-4"
                  />
                  <p className="text-center text-gray-600 mb-4">
                    Scan QRIS di atas menggunakan aplikasi e-wallet atau mobile banking Anda
                  </p>
                </div>
              </div>

              {/* Bank Transfer Alternative */}
              <div className="border-t-2 border-gray-200 pt-8">
                <h3 className="text-lg font-bold text-primary mb-4">Transfer Bank (Alternatif)</h3>
                <div className="bg-surface rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-600">Bank</label>
                    <p className="text-primary font-bold">{bankAccount.bank}</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Nomor Rekening</label>
                    <div className="flex items-center gap-2">
                      <p className="text-primary font-bold">{bankAccount.accountNumber}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(bankAccount.accountNumber);
                          alert('Nomor rekening disalin!');
                        }}
                        className="text-secondary hover:text-primary"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-600">Atas Nama</label>
                    <p className="text-primary font-bold">{bankAccount.accountName}</p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="border-t-2 border-gray-200 pt-8 mt-8">
                <h3 className="text-lg font-bold text-primary mb-4">Petunjuk Pembayaran</h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">1.</span>
                    <span>Scan QRIS atau transfer ke rekening bank di atas</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">2.</span>
                    <span>Transfer sebesar <strong>{formatRupiah(order.total)}</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">3.</span>
                    <span>Tunggu konfirmasi otomatis (biasanya 5-15 menit)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-primary flex-shrink-0">4.</span>
                    <span>Jika tidak auto-confirm, klik tombol "Konfirmasi Pembayaran"</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-primary mb-6">Detail Pesanan</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm font-bold text-gray-600">Nomor Pesanan</label>
                  <p className="text-primary font-bold text-lg">{order.order_number}</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600">Nama Penerima</label>
                  <p className="text-primary font-bold">{order.shipping_address.recipient_name}</p>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">Total Pembayaran</span>
                    <span className="text-2xl font-bold text-primary">{formatRupiah(order.total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmPayment}
                disabled={confirming}
                className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {confirming ? 'Mengonfirmasi...' : 'Konfirmasi Pembayaran'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Klik tombol di atas setelah Anda melakukan transfer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
