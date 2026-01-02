'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/horizon/widget/Widget';
import Card from '@/components/horizon/card';
import Image from 'next/image';
import {
  MdSearch,
  MdInventory,
  MdAdd,
  MdEdit,
  MdDelete,
  MdFileDownload,
  MdCheckCircle,
  MdCancel
} from 'react-icons/md';
import { supabase } from '@/lib/supabase';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm]);

  const loadProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select(`
          *,
          categories:category_id (name),
          stores:store_id (name)
        `)
        .order('created_at', { ascending: false });

      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Delete this product?')) return;

    try {
      await supabase.from('products').delete().eq('id', productId);
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete');
    }
  };

  const toggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);
      loadProducts();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Widget icon={<MdInventory className="h-6 w-6" />} title="Total Products" subtitle={totalProducts} />
        <Widget icon={<MdCheckCircle className="h-6 w-6" />} title="Active Products" subtitle={activeProducts} />
      </div>

      {/* Filters + Actions */}
      <Card extra="mt-5 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
            />
          </div>
          <button
            onClick={() => window.location.href = '/admin/products/new'}
            className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
          >
            <MdAdd /> Add Product
          </button>
        </div>
        <div className="mt-4 text-sm text-brand-500">
          {filteredProducts.length} products
        </div>
      </Card>

      {/* Products Table */}
      <Card extra="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-navy-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-navy-700 dark:text-white truncate">
                            {product.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {product.author || product.categories?.name || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-navy-700 dark:text-white">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.stock || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {product.stores?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleActive(product.id, product.is_active)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${product.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {product.is_active ? <MdCheckCircle /> : <MdCancel />}
                        {product.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.location.href = `/admin/products/${product.id}/edit`}
                          className="p-1.5 text-brand-500 hover:bg-brand-50 dark:hover:bg-navy-700 rounded"
                          title="Edit"
                        >
                          <MdEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
