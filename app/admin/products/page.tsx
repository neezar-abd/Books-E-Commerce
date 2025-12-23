'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ExportButton from '@/components/ExportButton';
import ImageUpload from '@/components/ImageUpload';
import {
  getAllProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProducts,
  uploadProductImage,
} from '@/lib/admin';
import { Search, Plus, Edit, Trash2, Image as ImageIcon, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category_id: '',
    description: '',
    price: '',
    original_price: '',
    discount: '',
    stock: '',
    rating: '',
    review_count: '',
    image: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    pages: '',
    language: 'Indonesia',
    is_featured: false,
    is_bestseller: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleOpenModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        author: product.author,
        category_id: product.category_id || '',
        description: product.description || '',
        price: product.price,
        original_price: product.original_price || '',
        discount: product.discount || '',
        stock: product.stock,
        rating: product.rating || '',
        review_count: product.review_count || '',
        image: product.image || '',
        isbn: product.isbn || '',
        publisher: product.publisher || '',
        publication_year: product.publication_year || '',
        pages: product.pages || '',
        language: product.language || 'Indonesia',
        is_featured: product.is_featured || false,
        is_bestseller: product.is_bestseller || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: '',
        author: '',
        category_id: '',
        description: '',
        price: '',
        original_price: '',
        discount: '',
        stock: '',
        rating: '',
        review_count: '',
        image: '',
        isbn: '',
        publisher: '',
        publication_year: '',
        pages: '',
        language: 'Indonesia',
        is_featured: false,
        is_bestseller: false,
      });
    }
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        alert('Judul produk wajib diisi');
        return;
      }
      if (!formData.author.trim()) {
        alert('Penulis produk wajib diisi');
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        alert('Harga produk harus lebih dari 0');
        return;
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        alert('Stok produk harus 0 atau lebih');
        return;
      }

      const productData = {
        ...formData,
        title: formData.title.trim(),
        author: formData.author.trim(),
        description: formData.description.trim(),
        publisher: formData.publisher.trim(),
        isbn: formData.isbn.trim(),
        language: formData.language.trim(),
        price: parseFloat(formData.price),
        original_price: formData.original_price
          ? parseFloat(formData.original_price)
          : null,
        discount: formData.discount ? parseInt(formData.discount) : 0,
        stock: parseInt(formData.stock),
        rating: formData.rating ? parseFloat(formData.rating) : 0,
        review_count: formData.review_count ? parseInt(formData.review_count) : 0,
        publication_year: formData.publication_year
          ? parseInt(formData.publication_year)
          : null,
        pages: formData.pages ? parseInt(formData.pages) : null,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        alert('✓ Produk berhasil diupdate!');
      } else {
        await createProduct(productData);
        alert('✓ Produk berhasil ditambahkan!');
      }

      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`❌ Gagal menyimpan produk:\n${error.message}`);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Yakin mau hapus produk ini? Ini tidak bisa diundur.')) return;

    try {
      await deleteProduct(productId);
      alert('✓ Produk berhasil dihapus!');
      loadData();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`❌ Gagal menghapus produk:\n${error.message}`);
    }
  };

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      alert('Please select at least one product to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedProducts).map(id =>
        deleteProduct(id)
      );
      await Promise.all(deletePromises);
      alert(`${selectedProducts.size} product(s) deleted successfully!`);
      setSelectedProducts(new Set());
      loadData();
    } catch (error) {
      console.error('Error deleting products:', error);
      alert('Failed to delete some products');
    }
  };

  const parseCSVData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      alert('CSV harus memiliki header dan minimal 1 data');
      return;
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const titleIndex = headers.findIndex(h => h.includes('judul'));
    const authorIndex = headers.findIndex(h => h.includes('penulis'));
    const descIndex = headers.findIndex(h => h.includes('deskripsi'));
    const priceIndex = headers.findIndex(h => h.includes('harga') && !h.includes('original'));
    const stockIndex = headers.findIndex(h => h.includes('stok'));
    const isbnIndex = headers.findIndex(h => h.includes('isbn'));
    const publisherIndex = headers.findIndex(h => h.includes('penerbit'));
    const yearIndex = headers.findIndex(h => h.includes('tahun') || h.includes('year'));
    const pagesIndex = headers.findIndex(h => h.includes('halaman') || h.includes('pages'));
    const discountIndex = headers.findIndex(h => h.includes('diskon') || h.includes('discount'));

    if (titleIndex === -1 || authorIndex === -1) {
      alert('CSV harus memiliki kolom "Judul Buku" dan "Penulis"');
      return;
    }

    // Parse data
    const products: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',').map(p => p.trim());
      
      // Parse price safely
      let price = 50000;
      if (priceIndex !== -1 && parts[priceIndex]) {
        const priceStr = parts[priceIndex].replace(/\D/g, '');
        const parsedPrice = parseInt(priceStr);
        if (!isNaN(parsedPrice) && parsedPrice > 0) {
          price = parsedPrice;
        }
      }

      // Parse discount safely
      let discount = 0;
      if (discountIndex !== -1 && parts[discountIndex]) {
        const discStr = parts[discountIndex].replace(/\D/g, '');
        const parsedDisc = parseInt(discStr);
        if (!isNaN(parsedDisc) && parsedDisc >= 0 && parsedDisc <= 100) {
          discount = parsedDisc;
        }
      }

      // Parse stock safely
      let stock = 10;
      if (stockIndex !== -1 && parts[stockIndex]) {
        const stockStr = parts[stockIndex].replace(/\D/g, '');
        const parsedStock = parseInt(stockStr);
        if (!isNaN(parsedStock) && parsedStock >= 0) {
          stock = parsedStock;
        }
      }

      // Parse year safely
      let year = null;
      if (yearIndex !== -1 && parts[yearIndex]) {
        const yearStr = parts[yearIndex].replace(/\D/g, '');
        const parsedYear = parseInt(yearStr);
        if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
          year = parsedYear;
        }
      }

      // Parse pages safely
      let pages = null;
      if (pagesIndex !== -1 && parts[pagesIndex]) {
        const pagesStr = parts[pagesIndex].replace(/\D/g, '');
        const parsedPages = parseInt(pagesStr);
        if (!isNaN(parsedPages) && parsedPages > 0) {
          pages = parsedPages;
        }
      }
      
      products.push({
        title: parts[titleIndex] || '',
        author: parts[authorIndex] || '',
        description: descIndex !== -1 ? parts[descIndex] || '' : '',
        price: price,
        original_price: null,
        discount: discount,
        stock: stock,
        rating: 0,
        review_count: 0,
        isbn: isbnIndex !== -1 ? parts[isbnIndex] || '' : '',
        publisher: publisherIndex !== -1 ? parts[publisherIndex] || '' : '',
        publication_year: year,
        pages: pages,
        language: 'Indonesia',
        is_featured: false,
        is_bestseller: false,
      });
    }

    if (products.length === 0) {
      alert('Tidak ada data yang valid dalam CSV');
      return;
    }

    setImportPreview(products);
  };

  const handleImportCSV = async () => {
    if (importPreview.length === 0) {
      alert('Tidak ada data untuk diimport');
      return;
    }

    if (!confirm(`Import ${importPreview.length} produk? Field yang kosong akan diisi dengan nilai default.`)) {
      return;
    }

    setIsImporting(true);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    try {
      for (let i = 0; i < importPreview.length; i++) {
        const product = importPreview[i];
        try {
          // Validate required fields
          if (!product.title || !product.author) {
            throw new Error(`Row ${i + 2}: Title dan Author wajib diisi`);
          }

          if (!product.price || product.price <= 0) {
            throw new Error(`Row ${i + 2}: Harga harus lebih dari 0`);
          }

          await createProduct(product);
          results.success++;
        } catch (error: any) {
          results.failed++;
          results.errors.push(error.message || `Row ${i + 2}: Unknown error`);
          console.error(`Error importing product ${i + 1}:`, error);
        }
      }

      // Show result summary
      let message = `✓ ${results.success} produk berhasil diimport!`;
      if (results.failed > 0) {
        message += `\n\n❌ ${results.failed} produk gagal:\n${results.errors.slice(0, 5).join('\n')}`;
        if (results.errors.length > 5) {
          message += `\n... dan ${results.errors.length - 5} error lainnya`;
        }
      }
      alert(message);

      if (results.success > 0) {
        setImportData('');
        setImportPreview([]);
        setShowImportModal(false);
        loadData();
      }
    } catch (error: any) {
      console.error('Error importing products:', error);
      alert(`Gagal mengimport produk: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportData(text);
      parseCSVData(text);
    };
    reader.readAsText(file);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Products Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your product catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton
              data={filteredProducts}
              filename="products"
              onExport={async () => await exportProducts()}
            />
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 size={20} />
                Delete {selectedProducts.size}
              </button>
            )}
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={20} />
              Import CSV
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Total: {filteredProducts.length} products
            </span>
            {filteredProducts.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all relative ${
                selectedProducts.has(product.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-100'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleSelectProduct(product.id)}
                className="absolute top-3 right-3 z-10 flex items-center justify-center"
              >
                {selectedProducts.has(product.id) ? (
                  <CheckCircle2 size={24} className="text-blue-600" />
                ) : (
                  <Circle size={24} className="text-gray-300 hover:text-gray-400" />
                )}
              </button>

              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                )}
                {product.stock < 10 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Low Stock
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{product.author}</p>

                <div className="flex items-center gap-2 mb-2">
                  {product.categories?.name && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {product.categories.name}
                    </span>
                  )}
                  {product.is_featured && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="font-bold text-gray-900">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Stock: {product.stock}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 my-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Author */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author *
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price
                  </label>
                  <input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Discount & Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount (%) 
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <ImageUpload
                  value={formData.image}
                  onChange={(url) => setFormData({ ...formData, image: url })}
                  onUpload={uploadProductImage}
                  bucket="products"
                  maxSize={5}
                />
                {formData.image && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Image URL:</p>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                      placeholder="Or paste URL directly..."
                      className="w-full px-3 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* ISBN, Publisher, Year */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) =>
                      setFormData({ ...formData, isbn: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publisher
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) =>
                      setFormData({ ...formData, publisher: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    value={formData.publication_year}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        publication_year: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pages, Language & Rating */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pages
                  </label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) =>
                      setFormData({ ...formData, pages: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (0-5)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Review Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.review_count}
                  onChange={(e) =>
                    setFormData({ ...formData, review_count: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Featured & Bestseller */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured Product
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_bestseller}
                    onChange={(e) =>
                      setFormData({ ...formData, is_bestseller: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Bestseller
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveProduct}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 my-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Import Produk dari CSV
            </h2>

            <div className="space-y-4">
              {/* Upload or Paste */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <div className="space-y-4">
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload File CSV
                    </label>
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="text-center text-gray-500">atau</div>

                  {/* Paste CSV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste CSV Data
                    </label>
                    <textarea
                      value={importData}
                      onChange={(e) => {
                        setImportData(e.target.value);
                        parseCSVData(e.target.value);
                      }}
                      placeholder="Judul Buku,Penulis,Deskripsi Singkat&#10;Laut Bercerita,Leila S. Chudori,Novel sejarah..."
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Preview */}
              {importPreview.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Preview ({importPreview.length} produk)
                  </h3>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left font-semibold">Judul</th>
                          <th className="px-4 py-2 text-left font-semibold">Penulis</th>
                          <th className="px-4 py-2 text-left font-semibold">Harga</th>
                          <th className="px-4 py-2 text-left font-semibold">Diskon</th>
                          <th className="px-4 py-2 text-left font-semibold">Stok</th>
                          <th className="px-4 py-2 text-left font-semibold">Penerbit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((product, i) => (
                          <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-2 text-xs">{product.title}</td>
                            <td className="px-4 py-2 text-xs">{product.author}</td>
                            <td className="px-4 py-2 text-xs">Rp{product.price.toLocaleString('id-ID')}</td>
                            <td className="px-4 py-2 text-xs">{product.discount}%</td>
                            <td className="px-4 py-2 text-xs">{product.stock}</td>
                            <td className="px-4 py-2 text-xs">{product.publisher || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    💡 Tip: Anda bisa edit harga, stok, dan detail lainnya setelah import
                  </p>
                </div>
              )}

              {/* Format Help */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Format CSV yang Didukung:</h4>
                <code className="text-xs text-blue-800 block whitespace-pre-wrap font-mono">
{`Judul Buku,Penulis,Deskripsi,Harga,Diskon,Stok,ISBN,Penerbit,Tahun,Halaman
Laut Bercerita,Leila S. Chudori,Novel sejarah,95000,10,15,978-602-309,Gramedia,2012,348
Amba,Laksmi Pamuntjak,Kisah epik,85000,0,20,978-602-123,Kepustakaan,2012,392`}
                </code>
                <p className="text-xs text-blue-700 mt-2">
                  ℹ️ Minimal dibutuhkan: Judul Buku, Penulis. Field lainnya optional.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleImportCSV}
                disabled={importPreview.length === 0 || isImporting}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    ✓ Import {importPreview.length} Produk
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setImportPreview([]);
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
}
