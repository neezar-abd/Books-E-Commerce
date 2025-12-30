'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, Mail, FileText, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SellerRegister() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        storeName: '',
        storeSlug: '',
        description: '',
        city: '',
        province: '',
        address: '',
        phone: '',
        email: '',
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setForm({
            ...form,
            storeName: name,
            storeSlug: generateSlug(name),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Check if user is logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/sign-in?redirect=/seller/register');
                return;
            }

            // Check if user already has a store
            const { data: existingStore } = await supabase
                .from('stores')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (existingStore) {
                setError('Anda sudah memiliki toko. Silakan ke dashboard seller.');
                return;
            }

            // Create store
            const { data: store, error: storeError } = await supabase
                .from('stores')
                .insert([{
                    owner_id: user.id,
                    name: form.storeName,
                    slug: form.storeSlug,
                    description: form.description,
                    city: form.city,
                    province: form.province,
                    address: form.address,
                    phone: form.phone,
                    email: form.email || user.email,
                    verification_status: 'pending',
                }])
                .select()
                .single();

            if (storeError) throw storeError;

            // Update user profile to seller role
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ role: 'seller' })
                .eq('id', user.id);

            if (profileError) throw profileError;

            setStep(3); // Success step
        } catch (err: any) {
            console.error('Error:', err);
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface">
            <Header />

            <main className="container-80 py-12">
                <div className="max-w-2xl mx-auto">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center mb-8">
                        {[1, 2, 3].map((s) => (
                            <React.Fragment key={s}>
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {step > s ? <CheckCircle size={20} /> : s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`w-20 h-1 ${step > s ? 'bg-primary' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between mb-8 text-sm text-gray-500 max-w-md mx-auto">
                        <span className={step >= 1 ? 'text-primary font-medium' : ''}>Info Toko</span>
                        <span className={step >= 2 ? 'text-primary font-medium' : ''}>Lokasi</span>
                        <span className={step >= 3 ? 'text-primary font-medium' : ''}>Selesai</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm p-8"
                    >
                        {step === 1 && (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Store size={32} className="text-primary" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-primary">Daftar Jadi Seller</h1>
                                    <p className="text-gray-500 mt-2">Mulai jual produk Anda di Zaree Marketplace</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nama Toko <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={form.storeName}
                                                onChange={handleNameChange}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Toko Sejahtera"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                URL Toko
                                            </label>
                                            <div className="flex items-center">
                                                <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm">
                                                    zaree.id/store/
                                                </span>
                                                <input
                                                    type="text"
                                                    value={form.storeSlug}
                                                    onChange={(e) => setForm({ ...form, storeSlug: e.target.value })}
                                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    placeholder="toko-sejahtera"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Deskripsi Toko
                                            </label>
                                            <textarea
                                                value={form.description}
                                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                                rows={3}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Ceritakan tentang toko Anda..."
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!form.storeName}
                                        className="w-full mt-6 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        Lanjutkan <ArrowRight size={18} />
                                    </button>
                                </form>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin size={32} className="text-primary" />
                                    </div>
                                    <h1 className="text-2xl font-bold text-primary">Lokasi & Kontak</h1>
                                    <p className="text-gray-500 mt-2">Informasi lokasi dan kontak toko Anda</p>
                                </div>

                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Kota <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.city}
                                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    placeholder="Jakarta"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Provinsi <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.province}
                                                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                    placeholder="DKI Jakarta"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Alamat Lengkap
                                            </label>
                                            <textarea
                                                value={form.address}
                                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                rows={2}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="Jl. Contoh No. 123..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nomor Telepon <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="08123456789"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email Toko
                                            </label>
                                            <input
                                                type="email"
                                                value={form.email}
                                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                placeholder="toko@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                        >
                                            Kembali
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || !form.city || !form.province || !form.phone}
                                            className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    Mendaftar...
                                                </>
                                            ) : (
                                                <>Daftar Sekarang</>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 3 && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-primary mb-2">Pendaftaran Berhasil!</h1>
                                <p className="text-gray-500 mb-6">
                                    Toko Anda sedang menunggu verifikasi dari tim kami.
                                    <br />
                                    Kami akan menghubungi Anda dalam 1-2 hari kerja.
                                </p>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => router.push('/seller/dashboard')}
                                        className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                                    >
                                        Ke Dashboard Seller
                                    </button>
                                    <button
                                        onClick={() => router.push('/')}
                                        className="w-full border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Kembali ke Beranda
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
