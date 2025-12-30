'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Package, X, Truck, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

interface Order {
    id: string;
    order_id: string;
    store_name: string;
    subtotal: number;
    shipping_cost: number;
    total: number;
    status: string;
    tracking_number: string;
    created_at: string;
    orders: {
        order_number: string;
        shipping_address: any;
        user_id: string;
    };
}

const STATUS_TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'pending', label: 'Belum Bayar' },
    { key: 'processing', label: 'Perlu Dikirim' },
    { key: 'shipped', label: 'Dikirim' },
    { key: 'delivered', label: 'Selesai' },
    { key: 'cancelled', label: 'Dibatalkan' },
];

export default function SellerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: store } = await supabase
                .from('stores')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (store) {
                const { data } = await supabase
                    .from('order_stores')
                    .select('*, orders(order_number, shipping_address, user_id)')
                    .eq('store_id', store.id)
                    .order('created_at', { ascending: false });

                setOrders(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, status: string, tracking?: string) => {
        setUpdating(true);
        try {
            const updateData: any = { status };
            if (tracking) updateData.tracking_number = tracking;
            if (status === 'shipped') updateData.shipped_at = new Date().toISOString();
            if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

            const { error } = await supabase
                .from('order_stores')
                .update(updateData)
                .eq('id', orderId);

            if (error) throw error;
            fetchOrders();
            setSelectedOrder(null);
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchFilter = statusFilter === 'all' || order.status === statusFilter;
        const matchSearch = order.orders?.order_number?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Menunggu';
            case 'processing': return 'Diproses';
            case 'shipped': return 'Dikirim';
            case 'delivered': return 'Selesai';
            case 'cancelled': return 'Batal';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'processing': return 'bg-blue-100 text-blue-700';
            case 'shipped': return 'bg-purple-100 text-purple-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-primary">Pesanan Saya</h1>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Status Tabs */}
                <div className="flex border-b overflow-x-auto">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setStatusFilter(tab.key)}
                            className={`px-6 py-4 text-sm font-medium transition-colors relative whitespace-nowrap ${statusFilter === tab.key
                                    ? 'text-primary'
                                    : 'text-gray-600 hover:text-primary'
                                }`}
                        >
                            {tab.label}
                            {statusFilter === tab.key && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nomor pesanan..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                        </div>
                        <button
                            onClick={() => { setSearch(''); setStatusFilter('all'); }}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Order Count */}
                <div className="px-4 py-3 border-b">
                    <span className="text-sm font-medium text-gray-700">{filteredOrders.length} Pesanan</span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-4">Produk</div>
                    <div className="col-span-2 text-center">Total Pesanan</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Pengiriman</div>
                    <div className="col-span-2 text-right">Aksi</div>
                </div>

                {/* Order Rows */}
                <div className="divide-y divide-gray-100">
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16">
                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                            >
                                {/* Order Info */}
                                <div className="col-span-4">
                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                        {order.orders?.order_number || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500 mb-1">
                                        {order.orders?.shipping_address?.recipient_name || '-'}
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {formatDate(order.created_at)}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="font-medium text-gray-900">
                                        {formatRupiah(order.total)}
                                    </span>
                                </div>

                                {/* Status */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>

                                {/* Shipping Info */}
                                <div className="col-span-2 flex flex-col items-center justify-center text-xs">
                                    {order.tracking_number ? (
                                        <>
                                            <span className="text-primary font-medium">{order.tracking_number}</span>
                                            <span className="text-gray-400">No. Resi</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex flex-col items-end justify-center gap-1">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-primary hover:text-primary/80 text-sm font-medium hover:underline"
                                    >
                                        Detail
                                    </button>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'processing')}
                                            className="text-green-600 hover:text-green-700 text-sm font-medium hover:underline"
                                        >
                                            Proses
                                        </button>
                                    )}
                                    {order.status === 'processing' && (
                                        <button
                                            onClick={() => {
                                                const resi = prompt('Masukkan nomor resi:');
                                                if (resi) updateOrderStatus(order.id, 'shipped', resi);
                                            }}
                                            className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline"
                                        >
                                            Kirim
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold text-primary">Detail Pesanan</h2>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Nomor Pesanan</p>
                                <p className="font-semibold">{selectedOrder.orders?.order_number}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusLabel(selectedOrder.status)}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Alamat Pengiriman</p>
                                <p className="font-medium">{selectedOrder.orders?.shipping_address?.recipient_name}</p>
                                <p className="text-sm text-gray-600">
                                    {selectedOrder.orders?.shipping_address?.address_line1}
                                    {', '}
                                    {selectedOrder.orders?.shipping_address?.city}
                                </p>
                            </div>
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span>{formatRupiah(selectedOrder.subtotal)}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-500">Ongkir</span>
                                    <span>{formatRupiah(selectedOrder.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span>Total</span>
                                    <span className="text-primary">{formatRupiah(selectedOrder.total)}</span>
                                </div>
                            </div>
                            {selectedOrder.tracking_number && (
                                <div>
                                    <p className="text-sm text-gray-500">Nomor Resi</p>
                                    <p className="font-mono font-semibold">{selectedOrder.tracking_number}</p>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex gap-2 pt-4 border-t">
                                {selectedOrder.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            updateOrderStatus(selectedOrder.id, 'processing');
                                        }}
                                        disabled={updating}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <CheckCircle size={18} />
                                        Proses Pesanan
                                    </button>
                                )}
                                {selectedOrder.status === 'processing' && (
                                    <button
                                        onClick={() => {
                                            const resi = prompt('Masukkan nomor resi:');
                                            if (resi) updateOrderStatus(selectedOrder.id, 'shipped', resi);
                                        }}
                                        disabled={updating}
                                        className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        <Truck size={18} />
                                        Kirim Pesanan
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
