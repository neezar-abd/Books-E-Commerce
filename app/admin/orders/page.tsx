'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/horizon/widget/Widget';
import Card from '@/components/horizon/card';
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  updateTrackingNumber,
} from '@/lib/admin';
import { MdSearch, MdFilterList, MdEdit, MdLocalShipping, MdFileDownload, MdShoppingCart } from 'react-icons/md';
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
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      if (editData.status !== selectedOrder.status) {
        await updateOrderStatus(selectedOrder.id, editData.status);
      }

      if (editData.payment_status !== selectedOrder.payment_status) {
        await updatePaymentStatus(selectedOrder.id, editData.payment_status);
      }

      if (editData.tracking_number !== selectedOrder.tracking_number) {
        await updateTrackingNumber(selectedOrder.id, editData.tracking_number);
      }

      setShowEditModal(false);
      loadOrders();
      alert('Order updated!');
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update');
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleExport = async () => {
    // TODO: Fix export implementation
    console.log('Export orders');
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

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
        <Widget icon={<MdShoppingCart className="h-6 w-6" />} title="Total Orders" subtitle={totalOrders} />
        <Widget icon={<MdLocalShipping className="h-6 w-6" />} title="Pending Orders" subtitle={pendingOrders} />
      </div>

      {/* Filters */}
      <Card extra="mt-5 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order number or customer..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <MdFileDownload /> Export
          </button>
        </div>
        <div className="mt-4 text-sm text-brand-500">
          {filteredOrders.length} orders
        </div>
      </Card>

      {/* Orders Table */}
      <Card extra="mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-navy-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-navy-700">
                    <td className="px-6 py-4 text-sm font-medium text-navy-700 dark:text-white">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-navy-700 dark:text-white font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-brand-100 text-brand-700 rounded-lg hover:bg-brand-200"
                      >
                        <MdEdit size={16} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal */}
      {showEditModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card extra="max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
              Edit Order: {selectedOrder.order_number}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-white mb-2">Status</label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-white mb-2">Payment Status</label>
                <select
                  value={editData.payment_status}
                  onChange={(e) => setEditData({ ...editData, payment_status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy-700 dark:text-white mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={editData.tracking_number}
                  onChange={(e) => setEditData({ ...editData, tracking_number: e.target.value })}
                  placeholder="Enter tracking number..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveOrder}
                className="flex-1 py-2 px-4 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
              >
                Save
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-navy-700 dark:text-white"
              >
                Cancel
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
