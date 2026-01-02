'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/horizon/widget/Widget';
import Card from '@/components/horizon/card';
import {
    getPendingProducts,
    getFlaggedProducts,
    getAllProductsForModeration,
    getModerationStats,
    ModerationProduct,
    ModerationStatus,
    ModerationStats
} from '@/lib/moderation';
import { supabase } from '@/lib/supabase';
import {
    MdSearch,
    MdCheck,
    MdClose,
    MdBlock,
    MdWarning,
    MdPending,
    MdThumbUp,
    MdThumbDown,
    MdFlag
} from 'react-icons/md';
import Image from 'next/image';

type TabType = 'pending' | 'flagged' | 'all';

export default function ModerationPage() {
    const [activeTab, setActiveTab] = useState<TabType>('pending');
    const [products, setProducts] = useState<ModerationProduct[]>([]);
    const [stats, setStats] = useState<ModerationStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<ModerationProduct | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'block' | null>(null);
    const [actionReason, setActionReason] = useState('');
    const [adminId, setAdminId] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        getCurrentUser();
    }, [activeTab]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setAdminId(user.id);
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const statsData = await getModerationStats();
            setStats(statsData);

            let productsData: ModerationProduct[] = [];
            if (activeTab === 'pending') {
                productsData = await getPendingProducts();
            } else if (activeTab === 'flagged') {
                productsData = await getFlaggedProducts();
            } else {
                productsData = await getAllProductsForModeration({ search: searchTerm || undefined });
            }
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = (product: ModerationProduct, action: 'approve' | 'reject' | 'block') => {
        setSelectedProduct(product);
        setActionType(action);
        setActionReason('');
        setShowActionModal(true);
    };

    const executeAction = async () => {
        if (!selectedProduct || !actionType || !adminId) return;

        try {
            const response = await fetch('/api/admin/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionType,
                    productId: selectedProduct.id,
                    reason: actionReason,
                    adminId: adminId
                })
            });

            const result = await response.json();
            if (!result.success) {
                alert(`Error: ${result.error}`);
                return;
            }

            setShowActionModal(false);
            setSelectedProduct(null);
            loadData();
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan');
        }
    };

    const getStatusBadge = (status: ModerationStatus) => {
        const styles: Record<ModerationStatus, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            blocked: 'bg-gray-800 text-white'
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const tabs = [
        { key: 'pending', label: 'Pending', icon: MdPending, count: stats?.pendingProducts || 0 },
        { key: 'flagged', label: 'Flagged', icon: MdFlag, count: stats?.flaggedProducts || 0 },
        { key: 'all', label: 'All Products', icon: MdSearch, count: null }
    ];

    return (
        <div>
            {/* Stats Widgets */}
            <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-5">
                <Widget icon={<MdPending className="h-6 w-6" />} title="Pending" subtitle={stats?.pendingProducts || 0} />
                <Widget icon={<MdFlag className="h-6 w-6" />} title="Flagged" subtitle={stats?.flaggedProducts || 0} />
                <Widget icon={<MdThumbUp className="h-6 w-6" />} title="Approved Today" subtitle={stats?.approvedToday || 0} />
                <Widget icon={<MdThumbDown className="h-6 w-6" />} title="Rejected Today" subtitle={stats?.rejectedToday || 0} />
                <Widget icon={<MdBlock className="h-6 w-6" />} title="Total Blocked" subtitle={stats?.blockedTotal || 0} />
            </div>

            {/* Tabs & Content */}
            <Card extra="mt-5">
                {/* Tab Headers */}
                <div className="flex border-b border-gray-200 dark:border-navy-700">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as TabType)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.key
                                ? 'border-brand-500 text-brand-500'
                                : 'border-transparent text-gray-600 hover:text-brand-500'
                                }`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                            {tab.count !== null && tab.count !== undefined && tab.count > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{tab.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Search (for All tab) */}
                {activeTab === 'all' && (
                    <div className="p-4 border-b border-gray-200 dark:border-navy-700">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadData()}
                                    placeholder="Search products..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                />
                            </div>
                            <button onClick={loadData} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                                Search
                            </button>
                        </div>
                    </div>
                )}

                {/* Product List */}
                <div className="divide-y divide-gray-200 dark:divide-navy-700">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16 text-gray-500">
                            No products found
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product.id} className="p-4 hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {product.images?.[0] ? (
                                            <Image src={product.images[0]} alt={product.title} width={64} height={64} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">📦</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-medium text-navy-700 dark:text-white truncate">{product.title}</h3>
                                                <p className="text-sm text-gray-500">{product.store?.name || 'Unknown'}</p>
                                                <p className="text-sm font-medium text-brand-500">{formatCurrency(product.price)}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {getStatusBadge(product.moderation_status)}
                                                {product.is_flagged && (
                                                    <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                                                        <MdWarning /> Flagged
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => handleAction(product, 'approve')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200"
                                            >
                                                <MdCheck /> Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(product, 'reject')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
                                            >
                                                <MdClose /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(product, 'block')}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
                                            >
                                                <MdBlock /> Block
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            {/* Action Modal */}
            {showActionModal && selectedProduct && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card extra="max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
                            {actionType === 'approve' && '✅ Approve Product'}
                            {actionType === 'reject' && '❌ Reject Product'}
                            {actionType === 'block' && '🚫 Block Product'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            <strong>{selectedProduct.title}</strong>
                        </p>
                        {(actionType === 'reject' || actionType === 'block') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason *</label>
                                <textarea
                                    value={actionReason}
                                    onChange={(e) => setActionReason(e.target.value)}
                                    placeholder="Enter reason..."
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                                />
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={executeAction}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white ${actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                    actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                        'bg-gray-800 hover:bg-gray-900'
                                    }`}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowActionModal(false)}
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
