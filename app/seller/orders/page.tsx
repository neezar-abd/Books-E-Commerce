'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Search, Eye, Truck, CheckCircle, Clock, X, Loader2 } from 'lucide-react';
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

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Menunggu', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'processing', label: 'Diproses', color: 'bg-blue-100 text-blue-700' },
    { value: 'shipped', label: 'Dikirim', color: 'bg-purple-100 text-purple-700' },
    { value: 'delivered', label: 'Selesai', color: 'bg-green-100 text-green-700' },
    { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-100 text-red-700' },
];

export default function SellerOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
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
        const matchFilter = filter === 'all' || order.status === filter;
        const matchSearch = order.orders?.order_number?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const getStatusBadge = (status: string) => {
        const opt = STATUS_OPTIONS.find(s => s.value === status);
        return opt ? <span className={`px-2 py-1 rounded-full text-xs font-medium ${opt.color}`}>{opt.label}</span> : status;
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
                <h1 className="text-2xl font-bold text-primary mb-2">Pesanan Masuk</h1>
                <p className="text-gray-500 mb-6">{orders.length} pesanan</p>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor pesanan..."
                            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            Semua
                        </button>
                        {STATUS_OPTIONS.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => setFilter(opt.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${filter === opt.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length > 0 ? (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-semibold text-primary">{order.orders?.order_number || 'N/A'}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-secondary">{formatRupiah(order.total)}</p>
                                        {order.tracking_number && (
                                            <p className="text-xs text-gray-500">Resi: {order.tracking_number}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                                    >
                                        <Eye size={14} /> Detail
                                    </button>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => updateOrderStatus(order.id, 'processing')}
                                            className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200"
                                        >
                                            <CheckCircle size={14} /> Proses
                                        </button>
                                    )}
                                    {order.status === 'processing' && (
                                        <button
                                            onClick={() => {
                                                const resi = prompt('Masukkan nomor resi:');
                                                if (resi) updateOrderStatus(order.id, 'shipped', resi);
                                            }}
                                            className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-600 rounded-lg text-sm hover:bg-purple-200"
                                        >
                                            <Truck size={14} /> Kirim
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-primary mb-2">Belum Ada Pesanan</h3>
                        <p className="text-gray-500">Pesanan akan muncul di sini saat ada pembeli</p>
                    </div>
                )}

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
                                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
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
                                        <span className="text-secondary">{formatRupiah(selectedOrder.total)}</span>
                                    </div>
                                </div>
                                {selectedOrder.tracking_number && (
                                    <div>
                                        <p className="text-sm text-gray-500">Nomor Resi</p>
                                        <p className="font-mono font-semibold">{selectedOrder.tracking_number}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        
    );
}
