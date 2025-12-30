'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Package, Star, AlertCircle, CheckCircle, Ban, Eye, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';

interface StoreData {
    id: string;
    name: string;
    slug: string;
    logo: string;
    city: string;
    province: string;
    total_products: number;
    total_sales: number;
    is_verified: boolean;
    is_active: boolean;
    verification_status: string;
    created_at: string;
    owner_id: string;
}

export default function AdminStores() {
    const [stores, setStores] = useState<StoreData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const { data, error } = await supabase
                .from('stores')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStores(data || []);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStoreStatus = async (storeId: string, updates: Partial<StoreData>) => {
        try {
            const { error } = await supabase
                .from('stores')
                .update(updates)
                .eq('id', storeId);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Status toko berhasil diupdate!' });
            fetchStores();
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const verifyStore = async (storeId: string) => {
        await updateStoreStatus(storeId, {
            is_verified: true,
            verification_status: 'approved',
        });
    };

    const rejectStore = async (storeId: string) => {
        const reason = prompt('Alasan penolakan:');
        if (!reason) return;
        await updateStoreStatus(storeId, {
            is_verified: false,
            verification_status: 'rejected',
        });
    };

    const toggleActive = async (storeId: string, currentStatus: boolean) => {
        await updateStoreStatus(storeId, { is_active: !currentStatus });
    };

    const filteredStores = stores.filter(store => {
        const matchFilter =
            filter === 'all' ||
            (filter === 'verified' && store.is_verified) ||
            (filter === 'pending' && store.verification_status === 'pending') ||
            (filter === 'inactive' && !store.is_active);
        const matchSearch = store.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Kelola Toko</h1>
                <p className="text-gray-500 mb-6">{stores.length} toko terdaftar</p>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari toko..."
                            className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'verified', 'pending', 'inactive'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {f === 'all' ? 'Semua' : f === 'verified' ? 'Terverifikasi' : f === 'pending' ? 'Pending' : 'Nonaktif'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stores Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStores.map((store) => (
                        <div
                            key={store.id}
                            className={`bg-white rounded-xl shadow-sm p-4 ${!store.is_active ? 'opacity-60' : ''}`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {store.logo ? (
                                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Store size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">{store.name}</h3>
                                    <p className="text-sm text-gray-500">{store.city}, {store.province}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {store.is_verified ? (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                                        ) : store.verification_status === 'pending' ? (
                                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                                        ) : (
                                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rejected</span>
                                        )}
                                        {!store.is_active && (
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Nonaktif</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <Package size={14} />
                                    {store.total_products} produk
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={14} />
                                    {store.total_sales} terjual
                                </span>
                            </div>

                            <div className="flex gap-2 mt-4 pt-4 border-t">
                                <Link
                                    href={`/store/${store.slug}`}
                                    target="_blank"
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm hover:bg-blue-200"
                                >
                                    <Eye size={14} /> Lihat
                                </Link>
                                {store.verification_status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => verifyStore(store.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200"
                                        >
                                            <CheckCircle size={14} /> Verify
                                        </button>
                                        <button
                                            onClick={() => rejectStore(store.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                                        >
                                            <Ban size={14} /> Tolak
                                        </button>
                                    </>
                                )}
                                {store.verification_status !== 'pending' && (
                                    <button
                                        onClick={() => toggleActive(store.id, store.is_active)}
                                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm ${store.is_active
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                    >
                                        {store.is_active ? (
                                            <><Ban size={14} /> Nonaktifkan</>
                                        ) : (
                                            <><CheckCircle size={14} /> Aktifkan</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredStores.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <Store size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Tidak Ada Toko</h3>
                        <p className="text-gray-500">Tidak ada toko yang sesuai dengan filter</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
