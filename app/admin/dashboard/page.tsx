'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/horizon/widget/Widget';
import Card from '@/components/horizon/card';
import { supabase } from '@/lib/supabase';
import {
  MdShoppingCart,
  MdStore,
  MdAttachMoney,
  MdPeople,
  MdBarChart,
  MdTrendingUp
} from 'react-icons/md';

interface DashboardStats {
  totalOrders: number;
  totalStores: number;
  totalUsers: number;
  totalProducts: number;
  totalRevenue: number;
  pendingModeration: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalStores: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingModeration: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [orders, stores, users, products] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('stores').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
      ]);

      // Get total revenue
      const { data: revenueData } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      // Try to get pending moderation count
      let pendingCount = 0;
      try {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('moderation_status', 'pending');
        pendingCount = count || 0;
      } catch (e) {
        // Column may not exist yet
      }

      setStats({
        totalOrders: orders.count || 0,
        totalStores: stores.count || 0,
        totalUsers: users.count || 0,
        totalProducts: products.count || 0,
        totalRevenue,
        pendingModeration: pendingCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Stats Widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        <Widget
          icon={<MdBarChart className="h-7 w-7" />}
          title="Total Revenue"
          subtitle={formatCurrency(stats.totalRevenue)}
        />
        <Widget
          icon={<MdShoppingCart className="h-6 w-6" />}
          title="Total Orders"
          subtitle={stats.totalOrders.toString()}
        />
        <Widget
          icon={<MdStore className="h-7 w-7" />}
          title="Total Stores"
          subtitle={stats.totalStores.toString()}
        />
        <Widget
          icon={<MdPeople className="h-6 w-6" />}
          title="Total Users"
          subtitle={stats.totalUsers.toString()}
        />
        <Widget
          icon={<MdTrendingUp className="h-7 w-7" />}
          title="Total Products"
          subtitle={stats.totalProducts.toString()}
        />
        <Widget
          icon={<MdAttachMoney className="h-6 w-6" />}
          title="Pending Review"
          subtitle={stats.pendingModeration.toString()}
        />
      </div>

      {/* Quick Actions */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <Card extra="p-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <a
              href="/admin/moderation"
              className="flex items-center gap-3 p-4 rounded-xl bg-lightPrimary hover:bg-brand-100 transition-colors text-navy-700 dark:bg-navy-700 dark:text-white"
            >
              <MdBarChart className="h-6 w-6 text-brand-500" />
              <span className="font-medium">Moderasi Produk</span>
            </a>
            <a
              href="/admin/stores"
              className="flex items-center gap-3 p-4 rounded-xl bg-lightPrimary hover:bg-brand-100 transition-colors text-navy-700 dark:bg-navy-700 dark:text-white"
            >
              <MdStore className="h-6 w-6 text-brand-500" />
              <span className="font-medium">Kelola Toko</span>
            </a>
            <a
              href="/admin/orders"
              className="flex items-center gap-3 p-4 rounded-xl bg-lightPrimary hover:bg-brand-100 transition-colors text-navy-700 dark:bg-navy-700 dark:text-white"
            >
              <MdShoppingCart className="h-6 w-6 text-brand-500" />
              <span className="font-medium">Lihat Orders</span>
            </a>
            <a
              href="/admin/settings"
              className="flex items-center gap-3 p-4 rounded-xl bg-lightPrimary hover:bg-brand-100 transition-colors text-navy-700 dark:bg-navy-700 dark:text-white"
            >
              <MdTrendingUp className="h-6 w-6 text-brand-500" />
              <span className="font-medium">Settings</span>
            </a>
          </div>
        </Card>

        <Card extra="p-6">
          <h3 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
            System Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Database</span>
              <span className="flex items-center gap-2 text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">API Server</span>
              <span className="flex items-center gap-2 text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Moderation Queue</span>
              <span className="flex items-center gap-2 text-yellow-500">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                {stats.pendingModeration} pending
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
