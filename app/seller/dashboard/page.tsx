'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Package, ShoppingBag, Star, TrendingUp, DollarSign,
    Eye, AlertCircle, CheckCircle, Clock
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

import Link from 'next/link';

interface Store {
    id: string;
    name: string;
    is_verified: boolean;
    verification_status: string;
    total_products: number;
    total_sales: number;
    rating: number;
}

export default function SellerDashboard() {
    const [store, setStore] = useState<Store | null>(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0,
        todayOrders: 0,
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get store
            const { data: storeData } = await supabase
                .from('stores')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (storeData) {
                setStore(storeData);

                // Get order stats (if order_stores table exists)
                try {
                    const { data: orders } = await supabase
                        .from('order_stores')
                        .select('*, orders(*)')
                        .eq('store_id', storeData.id)
                        .order('created_at', { ascending: false })
                        .limit(5);

                    if (orders) {
                        setRecentOrders(orders);
                        const pending = orders.filter(o => o.status === 'pending').length;
                        const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
                        setStats({
                            totalOrders: orders.length,
                            pendingOrders: pending,
                            totalRevenue: revenue,
                            todayOrders: 0,
                        });
                    }
                } catch (e) {
                    console.log('order_stores not available yet');
                }
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            
        );
    }

    if (!store) {
        return (
            
                <div className="flex flex-col items-center justify-center h-screen p-8">
                    <AlertCircle size={48} className="text-yellow-500 mb-4" />
                    <h1 className="text-xl font-bold text-primary mb-2">Toko Tidak Ditemukan</h1>
                    <p className="text-gray-500 mb-4">Anda belum memiliki toko.</p>
                    <Link
                        href="/seller/register"
                        className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90"
                    >
                        Daftar Jadi Seller
                    </Link>
                </div>
            
        );
    }

    return (
        
            <div className="p-6 lg:p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
                    <p className="text-gray-500">Selamat datang di Seller Center, {store.name}!</p>
                </div>

                {/* Verification Status Banner */}
                {!store.is_verified && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${store.verification_status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700'
                                : store.verification_status === 'rejected'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-blue-50 text-blue-700'
                            }`}
                    >
                        {store.verification_status === 'pending' ? (
                            <>
                                <Clock size={24} />
                                <div>
                                    <p className="font-semibold">Toko Anda Sedang Diverifikasi</p>
                                    <p className="text-sm opacity-80">Tim kami akan memverifikasi dalam 1-2 hari kerja.</p>
                                </div>
                            </>
                        ) : store.verification_status === 'rejected' ? (
                            <>
                                <AlertCircle size={24} />
                                <div>
                                    <p className="font-semibold">Verifikasi Ditolak</p>
                                    <p className="text-sm opacity-80">Silakan hubungi admin untuk informasi lebih lanjut.</p>
                                </div>
                            </>
                        ) : null}
                    </motion.div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: ShoppingBag, label: 'Total Pesanan', value: stats.totalOrders, color: 'bg-blue-500' },
                        { icon: Clock, label: 'Perlu Diproses', value: stats.pendingOrders, color: 'bg-yellow-500' },
                        { icon: DollarSign, label: 'Total Pendapatan', value: formatRupiah(stats.totalRevenue), color: 'bg-green-500' },
                        { icon: Package, label: 'Total Produk', value: store.total_products, color: 'bg-purple-500' },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white rounded-xl p-6 shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                                        <Icon size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{stat.label}</p>
                                        <p className="text-xl font-bold text-primary">{stat.value}</p>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-primary mb-4">Aksi Cepat</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/seller/products"
                                className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-primary/5 transition-colors"
                            >
                                <Package size={20} className="text-primary" />
                                <span className="font-medium text-primary">Tambah Produk</span>
                            </Link>
                            <Link
                                href="/seller/orders"
                                className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-primary/5 transition-colors"
                            >
                                <ShoppingBag size={20} className="text-primary" />
                                <span className="font-medium text-primary">Lihat Pesanan</span>
                            </Link>
                            <Link
                                href="/seller/store"
                                className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-primary/5 transition-colors"
                            >
                                <Eye size={20} className="text-primary" />
                                <span className="font-medium text-primary">Edit Toko</span>
                            </Link>
                            <Link
                                href="/seller/reviews"
                                className="flex items-center gap-3 p-4 bg-surface rounded-xl hover:bg-primary/5 transition-colors"
                            >
                                <Star size={20} className="text-primary" />
                                <span className="font-medium text-primary">Lihat Ulasan</span>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-primary mb-4">Performa Toko</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Rating Toko</span>
                                <div className="flex items-center gap-1">
                                    <Star size={16} fill="#F5BE30" className="text-secondary" />
                                    <span className="font-bold text-primary">{store.rating || '0.0'}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Total Penjualan</span>
                                <span className="font-bold text-primary">{store.total_sales}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Status Verifikasi</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${store.is_verified
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {store.is_verified ? 'Terverifikasi' : 'Pending'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-primary">Pesanan Terbaru</h2>
                        <Link href="/seller/orders" className="text-sm text-secondary hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-surface rounded-xl">
                                    <div>
                                        <p className="font-medium text-primary">{order.orders?.order_number || 'N/A'}</p>
                                        <p className="text-sm text-gray-500">{formatRupiah(order.total)}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <ShoppingBag size={40} className="mx-auto mb-2 opacity-50" />
                            <p>Belum ada pesanan</p>
                        </div>
                    )}
                </div>
            </div>
        
    );
}
