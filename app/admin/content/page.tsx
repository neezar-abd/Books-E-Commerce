'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Image, Tag, Star, Plus, Pencil, Trash2, Save, X, CheckCircle,
    AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';

interface Banner {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    image: string;
    bg_color: string;
    button_text: string;
    button_link: string;
    position: number;
    is_active: boolean;
}

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
}

interface Product {
    id: string;
    title: string;
    image: string;
    price: number;
    is_featured: boolean;
    is_bestseller: boolean;
}

export default function ContentManagement() {
    const [activeTab, setActiveTab] = useState<'banners' | 'categories' | 'featured'>('banners');
    const [banners, setBanners] = useState<Banner[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Form states
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showBannerForm, setShowBannerForm] = useState(false);
    const [showCategoryForm, setShowCategoryForm] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'banners') {
                const { data, error } = await supabase
                    .from('banners')
                    .select('*')
                    .order('position', { ascending: true });
                if (!error && data) setBanners(data);
            } else if (activeTab === 'categories') {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name', { ascending: true });
                if (!error && data) setCategories(data);
            } else if (activeTab === 'featured') {
                const { data, error } = await supabase
                    .from('products')
                    .select('id, title, image, price, is_featured, is_bestseller')
                    .order('title', { ascending: true });
                if (!error && data) setProducts(data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Banner functions
    const saveBanner = async (banner: Partial<Banner>) => {
        setSaving(true);
        try {
            if (editingBanner?.id) {
                const { error } = await supabase
                    .from('banners')
                    .update(banner)
                    .eq('id', editingBanner.id);
                if (error) throw error;
                showMessage('success', 'Banner berhasil diupdate!');
            } else {
                const { error } = await supabase
                    .from('banners')
                    .insert([{ ...banner, position: banners.length + 1 }]);
                if (error) throw error;
                showMessage('success', 'Banner berhasil ditambahkan!');
            }
            setEditingBanner(null);
            setShowBannerForm(false);
            fetchData();
        } catch (error: any) {
            showMessage('error', error.message || 'Gagal menyimpan banner');
        } finally {
            setSaving(false);
        }
    };

    const deleteBanner = async (id: string) => {
        if (!confirm('Yakin ingin menghapus banner ini?')) return;
        try {
            const { error } = await supabase.from('banners').delete().eq('id', id);
            if (error) throw error;
            showMessage('success', 'Banner berhasil dihapus!');
            fetchData();
        } catch (error: any) {
            showMessage('error', error.message || 'Gagal menghapus banner');
        }
    };

    const toggleBannerActive = async (id: string, isActive: boolean) => {
        try {
            const { error } = await supabase
                .from('banners')
                .update({ is_active: !isActive })
                .eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            showMessage('error', error.message);
        }
    };

    // Category functions
    const saveCategory = async (category: Partial<Category>) => {
        setSaving(true);
        try {
            const slug = category.name?.toLowerCase().replace(/\s+/g, '-');
            if (editingCategory?.id) {
                const { error } = await supabase
                    .from('categories')
                    .update({ ...category, slug })
                    .eq('id', editingCategory.id);
                if (error) throw error;
                showMessage('success', 'Kategori berhasil diupdate!');
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert([{ ...category, slug }]);
                if (error) throw error;
                showMessage('success', 'Kategori berhasil ditambahkan!');
            }
            setEditingCategory(null);
            setShowCategoryForm(false);
            fetchData();
        } catch (error: any) {
            showMessage('error', error.message || 'Gagal menyimpan kategori');
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (id: string) => {
        if (!confirm('Yakin ingin menghapus kategori ini?')) return;
        try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            showMessage('success', 'Kategori berhasil dihapus!');
            fetchData();
        } catch (error: any) {
            showMessage('error', error.message || 'Gagal menghapus kategori');
        }
    };

    // Featured product functions
    const toggleFeatured = async (id: string, isFeatured: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_featured: !isFeatured })
                .eq('id', id);
            if (error) throw error;
            fetchData();
            showMessage('success', isFeatured ? 'Produk dihapus dari featured' : 'Produk ditambahkan ke featured');
        } catch (error: any) {
            showMessage('error', error.message);
        }
    };

    const toggleBestseller = async (id: string, isBestseller: boolean) => {
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_bestseller: !isBestseller })
                .eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            showMessage('error', error.message);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Content Management</h1>

            {/* Message */}
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

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b">
                {[
                    { id: 'banners', label: 'Banners', icon: Image },
                    { id: 'categories', label: 'Kategori', icon: Tag },
                    { id: 'featured', label: 'Featured Products', icon: Star },
                ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-[2px] ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
                </div>
            ) : (
                <>
                    {/* Banners Tab */}
                    {activeTab === 'banners' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-gray-600">Kelola banner carousel di halaman utama</p>
                                <button
                                    onClick={() => {
                                        setEditingBanner(null);
                                        setShowBannerForm(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus size={18} />
                                    Tambah Banner
                                </button>
                            </div>

                            {/* Banner Form */}
                            {showBannerForm && (
                                <BannerForm
                                    banner={editingBanner}
                                    onSave={saveBanner}
                                    onCancel={() => {
                                        setShowBannerForm(false);
                                        setEditingBanner(null);
                                    }}
                                    saving={saving}
                                />
                            )}

                            {/* Banner List */}
                            <div className="space-y-4">
                                {banners.map((banner) => (
                                    <div
                                        key={banner.id}
                                        className={`bg-white rounded-lg shadow-sm p-4 flex items-center gap-4 ${!banner.is_active ? 'opacity-50' : ''
                                            }`}
                                    >
                                        <img
                                            src={banner.image}
                                            alt={banner.title}
                                            className="w-32 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800">{banner.title}</h3>
                                            <p className="text-sm text-gray-500">{banner.subtitle}</p>
                                            <p className="text-xs text-gray-400 mt-1">Position: {banner.position}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => toggleBannerActive(banner.id, banner.is_active)}
                                                className={`p-2 rounded-lg ${banner.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}
                                                title={banner.is_active ? 'Aktif' : 'Nonaktif'}
                                            >
                                                {banner.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingBanner(banner);
                                                    setShowBannerForm(true);
                                                }}
                                                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => deleteBanner(banner.id)}
                                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {banners.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">Belum ada banner. Tambahkan banner pertama!</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {activeTab === 'categories' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-gray-600">Kelola kategori produk</p>
                                <button
                                    onClick={() => {
                                        setEditingCategory(null);
                                        setShowCategoryForm(true);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus size={18} />
                                    Tambah Kategori
                                </button>
                            </div>

                            {/* Category Form */}
                            {showCategoryForm && (
                                <CategoryForm
                                    category={editingCategory}
                                    onSave={saveCategory}
                                    onCancel={() => {
                                        setShowCategoryForm(false);
                                        setEditingCategory(null);
                                    }}
                                    saving={saving}
                                />
                            )}

                            {/* Category List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <div key={category.id} className="bg-white rounded-lg shadow-sm p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{category.name}</h3>
                                                <p className="text-xs text-gray-400">/{category.slug}</p>
                                                {category.description && (
                                                    <p className="text-sm text-gray-500 mt-2">{category.description}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setShowCategoryForm(true);
                                                    }}
                                                    className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => deleteCategory(category.id)}
                                                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured Products Tab */}
                    {activeTab === 'featured' && (
                        <div>
                            <p className="text-gray-600 mb-4">
                                Pilih produk yang akan ditampilkan di halaman utama (maksimal 6 produk featured)
                            </p>
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                                ⭐ Featured: {products.filter(p => p.is_featured).length} produk dipilih
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`bg-white rounded-lg shadow-sm p-4 flex gap-4 ${product.is_featured ? 'ring-2 ring-yellow-400' : ''
                                            }`}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.title}
                                            className="w-16 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-800 truncate">{product.title}</h3>
                                            <p className="text-sm text-gray-500">{formatRupiah(product.price)}</p>
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => toggleFeatured(product.id, product.is_featured)}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${product.is_featured
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-yellow-50'
                                                        }`}
                                                >
                                                    <Star size={12} fill={product.is_featured ? 'currentColor' : 'none'} />
                                                    Featured
                                                </button>
                                                <button
                                                    onClick={() => toggleBestseller(product.id, product.is_bestseller)}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${product.is_bestseller
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-500 hover:bg-green-50'
                                                        }`}
                                                >
                                                    Bestseller
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// Banner Form Component
function BannerForm({
    banner,
    onSave,
    onCancel,
    saving,
}: {
    banner: Banner | null;
    onSave: (data: Partial<Banner>) => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const [form, setForm] = useState({
        title: banner?.title || '',
        subtitle: banner?.subtitle || '',
        description: banner?.description || '',
        image: banner?.image || '',
        bg_color: banner?.bg_color || 'from-primary to-primary/80',
        button_text: banner?.button_text || 'Belanja Sekarang',
        button_link: banner?.button_link || '/products',
    });

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">{banner ? 'Edit Banner' : 'Tambah Banner Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Promo Akhir Tahun"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                        type="text"
                        value={form.subtitle}
                        onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Diskon Hingga 50%"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={2}
                        placeholder="Belanja buku favorit dengan harga spesial"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                    <input
                        type="text"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Warna Background (Gradient)</label>
                    <select
                        value={form.bg_color}
                        onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="from-primary to-primary/80">Primary (Hijau)</option>
                        <option value="from-secondary to-secondary/80">Secondary (Kuning)</option>
                        <option value="from-red-500 to-red-600">Merah</option>
                        <option value="from-blue-500 to-blue-600">Biru</option>
                        <option value="from-purple-500 to-purple-600">Ungu</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teks Tombol</label>
                    <input
                        type="text"
                        value={form.button_text}
                        onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Belanja Sekarang"
                    />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Tombol</label>
                    <input
                        type="text"
                        value={form.button_link}
                        onChange={(e) => setForm({ ...form, button_link: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="/products"
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    Batal
                </button>
                <button
                    onClick={() => onSave(form)}
                    disabled={saving || !form.title || !form.image}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </div>
    );
}

// Category Form Component
function CategoryForm({
    category,
    onSave,
    onCancel,
    saving,
}: {
    category: Category | null;
    onSave: (data: Partial<Category>) => void;
    onCancel: () => void;
    saving: boolean;
}) {
    const [form, setForm] = useState({
        name: category?.name || '',
        description: category?.description || '',
    });

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
            <h3 className="text-lg font-semibold mb-4">{category ? 'Edit Kategori' : 'Tambah Kategori Baru'}</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Fiksi"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        rows={2}
                        placeholder="Deskripsi kategori..."
                    />
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                    Batal
                </button>
                <button
                    onClick={() => onSave(form)}
                    disabled={saving || !form.name}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save size={18} />
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </div>
    );
}
