'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import ExportButton from '@/components/ExportButton';
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
  exportOrders,
} from '@/lib/admin';
import { Search, Filter, Eye, Edit, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    payment_status: '',
    tracking_number: '',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const loadOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setEditData({
      status: order.status,
      payment_status: order.payment_status,
      tracking_number: order.tracking_number || '',
    });
    setShowEditModal(true);
  };

  const handleSaveOrder = async () => {
    if (!selectedOrder) return;

    try {
      // Update status if changed
      if (editData.status !== selectedOrder.status) {
        await updateOrderStatus(selectedOrder.id, editData.status);
      }

      // Update payment status if changed
      if (editData.payment_status !== selectedOrder.payment_status) {
        await updatePaymentStatus(selectedOrder.id, editData.payment_status);
      }

      // Update tracking number if changed
      if (editData.tracking_number !== selectedOrder.tracking_number) {
        await updateTrackingNumber(selectedOrder.id, editData.tracking_number);
      }

      setShowEditModal(false);
      loadOrders();
      alert('Order updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Pesanan Saya</h1>
          </div>
          <ExportButton
            data={filteredOrders}
            filename="orders"
          />
        </div>

        {/* Status Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            {[
              { key: 'all', label: 'Semua' },
              { key: 'pending', label: 'Belum Bayar' },
              { key: 'processing', label: 'Perlu Dikirim' },
              { key: 'shipped', label: 'Dikirim' },
              { key: 'delivered', label: 'Selesai' },
              { key: 'cancelled', label: 'Dibatalkan' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-6 py-4 text-sm font-medium transition-colors relative ${statusFilter === tab.key
                    ? 'text-primary'
                    : 'text-gray-600 hover:text-primary'
                  }`}
              >
                {tab.label}
                {statusFilter === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Search & Filter Row */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari nomor pesanan atau nama pelanggan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Orders Count */}
          <div className="px-4 py-3 border-b">
            <span className="text-sm font-medium text-gray-700">{filteredOrders.length} Pesanan</span>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
            <div className="col-span-4">Produk</div>
            <div className="col-span-2 text-center">Total Pesanan</div>
            <div className="col-span-2 text-center">Status</div>
            <div className="col-span-2 text-center">Pembayaran</div>
            <div className="col-span-2 text-right">Aksi</div>
          </div>

          {/* Order Rows */}
          <div className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Tidak ada pesanan ditemukan</p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Order Info */}
                  <div className="col-span-4">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {order.order_number}
                    </div>
                    <div className="text-xs text-gray-500 mb-1">
                      {order.profiles?.full_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(order.created_at)}
                    </div>
                    {order.tracking_number && (
                      <div className="text-xs text-primary flex items-center gap-1 mt-1">
                        <Package size={12} />
                        {order.tracking_number}
                      </div>
                    )}
                  </div>

                  {/* Total */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status === 'pending' ? 'Menunggu' :
                        order.status === 'processing' ? 'Diproses' :
                          order.status === 'shipped' ? 'Dikirim' :
                            order.status === 'delivered' ? 'Selesai' :
                              order.status === 'cancelled' ? 'Batal' : order.status}
                    </span>
                  </div>

                  {/* Payment Status */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}
                    >
                      {order.payment_status === 'pending' ? 'Belum Bayar' :
                        order.payment_status === 'paid' ? 'Lunas' :
                          order.payment_status === 'failed' ? 'Gagal' : order.payment_status}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex flex-col items-end justify-center gap-1">
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="text-primary hover:text-primary/80 text-sm font-medium hover:underline"
                    >
                      Detail
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Edit Order: {selectedOrder.order_number}
            </h2>

            <div className="space-y-4">
              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <select
                  value={editData.payment_status}
                  onChange={(e) =>
                    setEditData({ ...editData, payment_status: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Tracking Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={editData.tracking_number}
                  onChange={(e) =>
                    setEditData({ ...editData, tracking_number: e.target.value })
                  }
                  placeholder="Enter tracking number..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveOrder}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
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
