'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Package, Save, X, Loader2, Image as ImageIcon, CheckCircle2, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatRupiah } from '@/lib/utils';
import ImageUpload from '@/components/ImageUpload';

interface Product {
    id: string;
    title: string;
    sku?: string;
    brand?: string;
    weight?: number;
    price: number;
    original_price: number;
    stock: number;
    image: string;
    is_featured: boolean;
    category_id: string;
    description: string;
    total_sold?: number;
    condition?: string;
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
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    const [form, setForm] = useState({
        title: '',
        sku: '',
        brand: '',
        weight: '',
        price: '',
        original_price: '',
        stock: '',
        image: '',
        description: '',
        category_id: '',
        condition: 'new',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: store } = await supabase
                .from('stores')
                .select('id')
                .eq('owner_id', user.id)
                .single();

            if (store) {
                setStoreId(store.id);

                const { data: productsData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('store_id', store.id)
                    .order('created_at', { ascending: false });

                setProducts(productsData || []);
            }

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
            sku: '',
            brand: '',
            weight: '',
            price: '',
            original_price: '',
            stock: '',
            image: '',
            description: '',
            category_id: '',
            condition: 'new',
        });
        setEditingProduct(null);
        setShowForm(false);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setForm({
            title: product.title,
            sku: product.sku || '',
            brand: product.brand || '',
            weight: product.weight?.toString() || '',
            price: product.price.toString(),
            original_price: product.original_price?.toString() || '',
            stock: product.stock.toString(),
            image: product.image || '',
            description: product.description || '',
            category_id: product.category_id || '',
            condition: product.condition || 'new',
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
                sku: form.sku || null,
                brand: form.brand || null,
                weight: form.weight ? parseInt(form.weight) : null,
                price: parseFloat(form.price),
                original_price: form.original_price ? parseFloat(form.original_price) : null,
                stock: parseInt(form.stock),
                image: form.image,
                description: form.description,
                category_id: form.category_id || null,
                condition: form.condition,
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

    const handleSelectProduct = (id: string) => {
        const newSet = new Set(selectedProducts);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedProducts(newSet);
    };

    const handleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const filteredProducts = products.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase())) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
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
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-primary">Produk Saya</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-medium hover:bg-primary/90"
                >
                    <Plus size={18} />
                    Tambah Produk
                </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari produk..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setSearch('')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Product Count */}
                <div className="px-4 py-3 border-b">
                    <span className="text-sm font-medium text-gray-700">{filteredProducts.length} Produk</span>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
                    <div className="col-span-1 flex items-center">
                        <input
                            type="checkbox"
                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary rounded"
                        />
                    </div>
                    <div className="col-span-4">Info Produk</div>
                    <div className="col-span-2 text-center">Harga</div>
                    <div className="col-span-1 text-center">Stok</div>
                    <div className="col-span-2 text-center">Penjualan</div>
                    <div className="col-span-2 text-right">Aksi</div>
                </div>

                {/* Product Rows */}
                <div className="divide-y divide-gray-100">
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <Package size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-500 mb-4">Belum ada produk</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-primary text-white px-6 py-2 rounded-xl font-medium"
                            >
                                Tambah Produk
                            </button>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors ${selectedProducts.has(product.id) ? 'bg-primary/5' : ''
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className="col-span-1 flex items-start pt-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.has(product.id)}
                                        onChange={() => handleSelectProduct(product.id)}
                                        className="w-4 h-4 text-primary rounded"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="col-span-4 flex gap-3">
                                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="text-gray-400" size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                                            {product.title}
                                        </h3>
                                        <p className="text-xs text-gray-500 mb-1">
                                            <span className="text-gray-400">SKU:</span> {product.sku || '-'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            <span className="text-gray-400">Brand:</span> {product.brand || '-'}
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="col-span-2 flex items-center justify-center">
                                    <span className="font-medium text-gray-900">
                                        {formatRupiah(product.price)}
                                    </span>
                                </div>

                                {/* Stock */}
                                <div className="col-span-1 flex items-center justify-center">
                                    <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {product.stock}
                                    </span>
                                </div>

                                {/* Sales */}
                                <div className="col-span-2 flex flex-col justify-center text-sm text-center">
                                    <span className="font-medium text-gray-900">{product.total_sold || 0}</span>
                                    <span className="text-xs text-gray-500">Terjual</span>
                                    {product.is_featured && (
                                        <div className="flex items-center justify-center gap-1 mt-1 text-green-600">
                                            <CheckCircle2 size={12} />
                                            <span className="text-xs">Featured</span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex flex-col items-end justify-center gap-1">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-primary hover:text-primary/80 text-sm font-medium hover:underline"
                                    >
                                        Ubah
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium hover:underline"
                                    >
                                        Hapus
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand/Merk</label>
                                    <input
                                        type="text"
                                        value={form.brand}
                                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        placeholder="Contoh: Samsung, Nike, dll"
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                                    <input
                                        type="text"
                                        value={form.sku}
                                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                        placeholder="Kode unik produk"
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga Asli (coret)</label>
                                    <input
                                        type="number"
                                        value={form.original_price}
                                        onChange={(e) => setForm({ ...form, original_price: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Berat (gram)</label>
                                    <input
                                        type="number"
                                        value={form.weight}
                                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                                        placeholder="gram"
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi</label>
                                    <select
                                        value={form.condition}
                                        onChange={(e) => setForm({ ...form, condition: e.target.value })}
                                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="new">Baru</option>
                                        <option value="used">Bekas</option>
                                        <option value="refurbished">Refurbished</option>
                                    </select>
                                </div>
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Produk</label>
                                <ImageUpload
                                    value={form.image}
                                    onChange={(url) => setForm({ ...form, image: url })}
                                    onUpload={async (file) => {
                                        const fileExt = file.name.split('.').pop();
                                        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                                        const filePath = `products/${fileName}`;

                                        const { error: uploadError } = await supabase.storage
                                            .from('products')
                                            .upload(filePath, file);

                                        if (uploadError) throw uploadError;

                                        const { data } = supabase.storage
                                            .from('products')
                                            .getPublicUrl(filePath);

                                        return data.publicUrl;
                                    }}
                                    maxSize={5}
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
        </div>
    );
}
