'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/horizon/card';
import VariantsManager from '@/components/seller/VariantsManager';
import ShippingOptions from '@/components/seller/ShippingOptions';
import CategorySelector from '@/components/seller/CategorySelector';
import {
    MdImage,
    MdVideoLibrary,
    MdDescription,
    MdLocalShipping,
    MdInventory,
    MdColorLens,
    MdSave,
    MdPreview,
    MdArrowBack
} from 'react-icons/md';

interface ProductFormData {
    // Basic Info
    title: string;
    category_id: string;
    description: string;

    // Media
    images: string[];
    video_url: string;

    // Pricing & Stock (if no variants)
    price: number;
    stock: number;

    // Purchase Settings
    min_purchase: number;
    max_purchase: number;

    // Specifications
    brand: string;
    origin_country: string;
    warranty_type: string;
    warranty_period: string;

    // Shipping
    weight_grams: number;
    length_cm: number;
    width_cm: number;
    height_cm: number;

    // Other
    condition: 'new' | 'used';
    gtin: string;
    sku: string;

    // Variants
    hasVariants: boolean;
}

export default function NewProductPage() {
    const router = useRouter();
    const [currentSection, setCurrentSection] = useState(0);
    const [formData, setFormData] = useState<ProductFormData>({
        title: '',
        category_id: '',
        description: '',
        images: [],
        video_url: '',
        price: 0,
        stock: 0,
        min_purchase: 1,
        max_purchase: 0,
        brand: '',
        origin_country: 'Indonesia',
        warranty_type: '',
        warranty_period: '',
        weight_grams: 0,
        length_cm: 0,
        width_cm: 0,
        height_cm: 0,
        condition: 'new',
        gtin: '',
        sku: '',
        hasVariants: false,
    });

    const sections = [
        { id: 0, title: 'Info Produk', icon: MdInventory },
        { id: 1, title: 'Foto & Video', icon: MdImage },
        { id: 2, title: 'Spesifikasi', icon: MdDescription },
        { id: 3, title: 'Varian Produk', icon: MdColorLens },
        { id: 4, title: 'Pengiriman', icon: MdLocalShipping },
    ];

    const updateField = (field: keyof ProductFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        // TODO: Submit to API
        console.log('Form data:', formData);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-navy-700 rounded-lg"
                            >
                                <MdArrowBack className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Tambah Produk Baru</h1>
                                <p className="text-sm text-gray-500">Isi semua informasi produk dengan lengkap</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-navy-700 dark:text-white flex items-center gap-2"
                            >
                                <MdPreview /> Preview
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 flex items-center gap-2"
                            >
                                <MdSave /> Simpan Produk
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-12 gap-6">
                    {/* Sidebar Navigation */}
                    <div className="col-span-3">
                        <Card extra="p-4 sticky top-24">
                            <h3 className="font-semibold text-navy-700 dark:text-white mb-4">Sections</h3>
                            <nav className="space-y-1">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => setCurrentSection(section.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${currentSection === section.id
                                                ? 'bg-brand-500 text-white'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-navy-700'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{section.title}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </Card>
                    </div>

                    {/* Form Content */}
                    <div className="col-span-9">
                        {/* Section 0: Info Produk */}
                        {currentSection === 0 && (
                            <Card extra="p-6">
                                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-6">Informasi Produk</h2>

                                <div className="space-y-6">
                                    {/* Product Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Nama Produk <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => updateField('title', e.target.value)}
                                            placeholder="Contoh: Kaos Cotton Premium Unisex"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            maxLength={100}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 karakter</p>
                                    </div>

                                    {/* Category */}
                                    <CategorySelector
                                        value={formData.category_id}
                                        onChange={(categoryId) => updateField('category_id', categoryId)}
                                    />

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Deskripsi Produk <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => updateField('description', e.target.value)}
                                            placeholder="Jelaskan produk Anda secara detail (min. 200 karakter)"
                                            rows={8}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formData.description.length} karakter (min. 200)
                                        </p>
                                    </div>

                                    {/* Price & Stock (if no variants) */}
                                    {!formData.hasVariants && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Harga <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                                                    <input
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={(e) => updateField('price', parseInt(e.target.value) || 0)}
                                                        placeholder="0"
                                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Stok <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={formData.stock}
                                                    onChange={(e) => updateField('stock', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Min/Max Purchase */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Minimum Pembelian
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.min_purchase}
                                                onChange={(e) => updateField('min_purchase', parseInt(e.target.value) || 1)}
                                                min={1}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Maximum Pembelian <span className="text-gray-400">(Opsional)</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.max_purchase}
                                                onChange={(e) => updateField('max_purchase', parseInt(e.target.value) || 0)}
                                                placeholder="Tidak terbatas"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Condition */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Kondisi
                                        </label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="new"
                                                    checked={formData.condition === 'new'}
                                                    onChange={(e) => updateField('condition', e.target.value)}
                                                    className="w-4 h-4"
                                                />
                                                <span>Baru</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    value="used"
                                                    checked={formData.condition === 'used'}
                                                    onChange={(e) => updateField('condition', e.target.value)}
                                                    className="w-4 h-4"
                                                />
                                                <span>Bekas</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Section 1: Foto & Video */}
                        {currentSection === 1 && (
                            <Card extra="p-6">
                                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-6">Foto & Video Produk</h2>

                                <div className="space-y-6">
                                    {/* Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Foto Produk <span className="text-red-500">*</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">Upload 3-5 foto produk (Max 3MB per foto)</p>

                                        <div className="grid grid-cols-5 gap-4">
                                            {[0, 1, 2, 3, 4].map((idx) => (
                                                <div
                                                    key={idx}
                                                    className="aspect-square border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-brand-500 transition-colors"
                                                >
                                                    <div className="text-center p-4">
                                                        <MdImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                                        <p className="text-xs text-gray-500">Upload</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Video Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Video Produk <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <p className="text-xs text-gray-500 mb-3">Upload video produk (Max 30MB, 10-60 detik)</p>

                                        <div className="border-2 border-dashed border-gray-300 dark:border-navy-600 rounded-lg p-8 text-center cursor-pointer hover:border-brand-500 transition-colors">
                                            <MdVideoLibrary className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Klik untuk upload video</p>
                                            <p className="text-xs text-gray-400 mt-1">MP4, max 30MB</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Section 2: Spesifikasi */}
                        {currentSection === 2 && (
                            <Card extra="p-6">
                                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-6">Spesifikasi Produk</h2>
                                <p className="text-sm text-gray-500 mb-6">Semua field di bagian ini bersifat opsional</p>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Merek
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.brand}
                                                onChange={(e) => updateField('brand', e.target.value)}
                                                placeholder="Contoh: Nike, Samsung, dll"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Asal Negara
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.origin_country}
                                                onChange={(e) => updateField('origin_country', e.target.value)}
                                                placeholder="Indonesia"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid -cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Jenis Garansi
                                            </label>
                                            <select
                                                value={formData.warranty_type}
                                                onChange={(e) => updateField('warranty_type', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            >
                                                <option value="">Tidak ada garansi</option>
                                                <option value="Toko">Garansi Toko</option>
                                                <option value="Distributor">Garansi Distributor</option>
                                                <option value="Internasional">Garansi Internasional</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Masa Garansi
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.warranty_period}
                                                onChange={(e) => updateField('warranty_period', e.target.value)}
                                                placeholder="Contoh: 7 Hari, 1 Tahun"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                SKU
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.sku}
                                                onChange={(e) => updateField('sku', e.target.value)}
                                                placeholder="Kode SKU produk"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Barcode (GTIN)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.gtin}
                                                onChange={(e) => updateField('gtin', e.target.value)}
                                                placeholder="Kode barcode produk"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Section 3: Varian */}
                        {currentSection === 3 && (
                            <Card extra="p-6">
                                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-6">Varian Produk</h2>
                                <p className="text-sm text-gray-500 mb-6">
                                    Tambahkan varian seperti warna, ukuran, bahan, dll. Sistem akan otomatis generate kombinasi.
                                </p>

                                <VariantsManager />
                            </Card>
                        )}

                        {/* Section 4: Pengiriman */}
                        {currentSection === 4 && (
                            <Card extra="p-6">
                                <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-6">Pengiriman</h2>

                                <div className="space-y-6">
                                    {/* Weight */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Berat <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.weight_grams}
                                                onChange={(e) => updateField('weight_grams', parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">gram</span>
                                        </div>
                                    </div>

                                    {/* Dimensions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Ukuran Paket <span className="text-gray-400">(Opsional)</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <input
                                                    type="number"
                                                    value={formData.length_cm}
                                                    onChange={(e) => updateField('length_cm', parseInt(e.target.value) || 0)}
                                                    placeholder="Panjang (cm)"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    value={formData.width_cm}
                                                    onChange={(e) => updateField('width_cm', parseInt(e.target.value) || 0)}
                                                    placeholder="Lebar (cm)"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                                />
                                            </div>
                                            <div>
                                                <input
                                                    type="number"
                                                    value={formData.height_cm}
                                                    onChange={(e) => updateField('height_cm', parseInt(e.target.value) || 0)}
                                                    placeholder="Tinggi (cm)"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Options */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Opsi Pengiriman
                                        </label>
                                        <ShippingOptions productWeight={formData.weight_grams} />
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
