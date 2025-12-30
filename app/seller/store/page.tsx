'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Camera, Save, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';


interface StoreData {
    id: string;
    name: string;
    slug: string;
    description: string;
    logo: string;
    banner: string;
    city: string;
    province: string;
    address: string;
    phone: string;
    email: string;
}

export default function SellerStore() {
    const [store, setStore] = useState<StoreData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchStore();
    }, []);

    const fetchStore = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('stores')
                .select('*')
                .eq('owner_id', user.id)
                .single();

            if (data) setStore(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!store) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('stores')
                .update({
                    name: store.name,
                    description: store.description,
                    city: store.city,
                    province: store.province,
                    address: store.address,
                    phone: store.phone,
                    email: store.email,
                    logo: store.logo,
                    banner: store.banner,
                })
                .eq('id', store.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Toko berhasil diupdate!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Gagal menyimpan' });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
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
                    <h1 className="text-xl font-bold text-primary">Toko Tidak Ditemukan</h1>
                </div>
            
        );
    }

    return (
        
            <div className="p-6 lg:p-8 max-w-4xl">
                <h1 className="text-2xl font-bold text-primary mb-2">Profil Toko</h1>
                <p className="text-gray-500 mb-6">Kelola informasi toko Anda</p>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        {message.text}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Banner */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Banner Toko</label>
                        <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden">
                            {store.banner && (
                                <img src={store.banner} alt="Banner" className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <label className="cursor-pointer bg-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                                    <Camera size={16} />
                                    Ganti Banner
                                    <input
                                        type="text"
                                        placeholder="URL Banner"
                                        value={store.banner || ''}
                                        onChange={(e) => setStore({ ...store, banner: e.target.value })}
                                        className="absolute inset-0 opacity-0"
                                    />
                                </label>
                            </div>
                        </div>
                        <input
                            type="text"
                            value={store.banner || ''}
                            onChange={(e) => setStore({ ...store, banner: e.target.value })}
                            className="mt-2 w-full px-4 py-2 border rounded-lg text-sm"
                            placeholder="URL gambar banner..."
                        />
                    </div>

                    {/* Logo & Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Toko</label>
                            <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden mb-2">
                                {store.logo ? (
                                    <img src={store.logo} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <Store size={32} />
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={store.logo || ''}
                                onChange={(e) => setStore({ ...store, logo: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                                placeholder="URL logo..."
                            />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
                                <input
                                    type="text"
                                    value={store.name}
                                    onChange={(e) => setStore({ ...store, name: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">URL Toko</label>
                                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl">
                                    uchinagabooks.com/store/<span className="font-medium">{store.slug}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Toko</label>
                        <textarea
                            value={store.description || ''}
                            onChange={(e) => setStore({ ...store, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                            placeholder="Ceritakan tentang toko Anda..."
                        />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                            <input
                                type="text"
                                value={store.city || ''}
                                onChange={(e) => setStore({ ...store, city: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                            <input
                                type="text"
                                value={store.province || ''}
                                onChange={(e) => setStore({ ...store, province: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                        <textarea
                            value={store.address || ''}
                            onChange={(e) => setStore({ ...store, address: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                            <input
                                type="tel"
                                value={store.phone || ''}
                                onChange={(e) => setStore({ ...store, phone: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={store.email || ''}
                                onChange={(e) => setStore({ ...store, email: e.target.value })}
                                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Simpan Perubahan
                            </>
                        )}
                    </button>
                </form>
            </div>
        
    );
}
