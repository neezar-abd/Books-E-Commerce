'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Package, Save, X, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';


interface Product {
    id: string;
    title: string;
    author: string;
    price: number;
    original_price: number;
    stock: number;
    image: string;
    is_featured: boolean;
    category_id: string;
    description: string;
}

export default function SellerProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: '',
        author: '',
        price: '',
        original_price: '',
        stock: '',
        image: '',
        description: '',
        category_id: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get store
            const { data: store } = await supabase
                .from('stores')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (store) {
                setStoreId(store.id);

                // Get products
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('store_id', store.id)
                    .order('created_at', { ascending: false });

                setProducts(productsData || []);
            }

            // Get categories
            const { data: cats } = await supabase.from('categories').select('*');
            setCategories(cats || []);

        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            author: '',
            price: '',
            original_price: '',
            stock: '',
            image: '',
            description: '',
            category_id: '',
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setForm({
            title: product.title,
            author: product.author,
            price: product.price.toString(),
            original_price: product.original_price?.toString() || '',
            stock: product.stock.toString(),
            image: product.image || '',
            description: product.description || '',
            category_id: product.category_id || '',
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!storeId) return;

        setSaving(true);
        try {
            const productData = {
                title: form.title,
                author: form.author,
                price: parseFloat(form.price),
                original_price: form.original_price ? parseFloat(form.original_price) : null,
                stock: parseInt(form.stock),
                image: form.image,
                description: form.description,
                category_id: form.category_id || null,
                store_id: storeId,
            };

            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', editingProduct.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                if (error) throw error;
            }

            fetchData();
            resetForm();
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchData();
        } catch (err: any) {
            alert('Error: ' + err.message);
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            
                <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            
        );
    }

    return (
        
            <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Produk Saya</h1>
                        <p className="text-gray-500">{products.length} produk</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary/90"
                    >
                        <Plus size={18} />
                        Tambah Produk
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari produk..."
                        className="w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Product Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b flex items-center justify-between">
                                <h2 className="text-xl font-bold text-primary">
                                    {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                                </h2>
                                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Judul Buku *</label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Penulis *</label>
                                    <input
                                        type="text"
                                        value={form.author}
                                        onChange={(e) => setForm({ ...form, author: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
                                        <input
                                            type="number"
                                            value={form.price}
                                            onChange={(e) => setForm({ ...form, price: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga Asli</label>
                                        <input
                                            type="number"
                                            value={form.original_price}
                                            onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok *</label>
                                        <input
                                            type="number"
                                            value={form.stock}
                                            onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                        <select
                                            value={form.category_id}
                                            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="">Pilih Kategori</option>
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                                    <input
                                        type="text"
                                        value={form.image}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 border border-gray-200 py-3 rounded-xl font-medium hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                        {saving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Products Grid */}
                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="h-40 bg-gray-100">
                                    {product.image ? (
                                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={40} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-primary truncate">{product.title}</h3>
                                    <p className="text-sm text-gray-500">{product.author}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="font-bold text-secondary">{formatRupiah(product.price)}</span>
                                        <span className="text-sm text-gray-400">Stok: {product.stock}</span>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-sm"
                                        >
                                            <Pencil size={14} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
                                        >
                                            <Trash2 size={14} /> Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-xl">
                        <Package size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-semibold text-primary mb-2">Belum Ada Produk</h3>
                        <p className="text-gray-500 mb-4">Mulai tambahkan produk pertama Anda</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="bg-primary text-white px-6 py-2 rounded-xl font-medium"
                        >
                            Tambah Produk
                        </button>
                    </div>
                )}
            </div>
        
    );
}
