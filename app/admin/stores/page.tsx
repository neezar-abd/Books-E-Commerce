'use client';

import { useEffect, useState } from 'react';
import Widget from '@/components/horizon/widget/Widget';
import Card from '@/components/horizon/card';
import {
    getAllStores,
    getStoreStats,
    verifyStore,
    rejectStore,
    suspendStore,
    unsuspendStore,
    ManagedStore,
    StoreStats,
    VerificationStatus
} from '@/lib/store-management';
import { supabase } from '@/lib/supabase';
import {
    MdStore,
    MdVerified,
    MdPending,
    MdBlock,
    MdSearch,
    MdCheck,
    MdClose,
    MdPause,
    MdPlayArrow
} from 'react-icons/md';

export default function AdminStores() {
    const [stores, setStores] = useState<ManagedStore[]>([]);
    const [stats, setStats] = useState<StoreStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<VerificationStatus | 'all'>('all');
    const [adminId, setAdminId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Modal state
    const [actionModal, setActionModal] = useState<{
        show: boolean;
        store: ManagedStore | null;
        action: 'reject' | 'suspend' | null;
    }>({ show: false, store: null, action: null });
    const [actionReason, setActionReason] = useState('');

    useEffect(() => {
        loadData();
        getCurrentUser();
    }, [statusFilter]);

    const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setAdminId(user.id);
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [statsData, storesData] = await Promise.all([
                getStoreStats(),
                getAllStores({ status: statusFilter, search: searchTerm || undefined })
            ]);
            setStats(statsData);
            setStores(storesData);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleVerify = async (storeId: string) => {
        if (!adminId) {
            showMessage('error', 'Admin ID not found. Please refresh and try again.');
            return;
        }
        try {
            await verifyStore(storeId, adminId);
            showMessage('success', 'Store verified successfully!');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message || 'Failed to verify store');
        }
    };

    const handleReject = async () => {
        if (!adminId || !actionModal.store || !actionReason.trim()) {
            showMessage('error', 'Please provide a reason');
            return;
        }
        try {
            await rejectStore(actionModal.store.id, adminId, actionReason);
            showMessage('success', 'Store rejected');
            setActionModal({ show: false, store: null, action: null });
            setActionReason('');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message || 'Failed to reject store');
        }
    };

    const handleSuspend = async () => {
        if (!adminId || !actionModal.store || !actionReason.trim()) {
            showMessage('error', 'Please provide a reason');
            return;
        }
        try {
            await suspendStore(actionModal.store.id, adminId, actionReason);
            showMessage('success', 'Store suspended');
            setActionModal({ show: false, store: null, action: null });
            setActionReason('');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message || 'Failed to suspend store');
        }
    };

    const handleUnsuspend = async (storeId: string) => {
        if (!adminId) {
            showMessage('error', 'Admin ID not found');
            return;
        }
        try {
            await unsuspendStore(storeId, adminId);
            showMessage('success', 'Store unsuspended');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message || 'Failed to unsuspend store');
        }
    };

    const getStatusBadge = (status: VerificationStatus) => {
        const statusConfig = {
            pending: { bg: 'bg-yellow-100 text-yellow-600', icon: MdPending, text: 'Pending' },
            verified: { bg: 'bg-green-100 text-green-600', icon: MdVerified, text: 'Verified' },
            rejected: { bg: 'bg-red-100 text-red-600', icon: MdClose, text: 'Rejected' },
            suspended: { bg: 'bg-gray-800 text-white', icon: MdBlock, text: 'Suspended' },
        };
        const config = statusConfig[status];
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg}`}>
                <Icon className="w-3 h-3" /> {config.text}
            </span>
        );
    };

    return (
        <div className="mt-3 w-full">
            {/* Notification */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white font-medium`}>
                    {message.text}
                </div>
            )}

            {/* Stats Widgets */}
            <div className="mb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                <Widget
                    icon={<MdPending className="h-7 w-7" />}
                    title="Pending"
                    subtitle={String(stats?.pendingStores ?? 0)}
                />
                <Widget
                    icon={<MdVerified className="h-7 w-7" />}
                    title="Verified"
                    subtitle={String(stats?.verifiedStores ?? 0)}
                />
                <Widget
                    icon={<MdBlock className="h-7 w-7" />}
                    title="Suspended"
                    subtitle={String(stats?.suspendedStores ?? 0)}
                />
                <Widget
                    icon={<MdStore className="h-7 w-7" />}
                    title="Total Stores"
                    subtitle={String(stats?.totalStores ?? 0)}
                />
            </div>

            {/* Search & Filter */}
            <Card extra="p-4 mb-5">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search stores..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as VerificationStatus | 'all')}
                        className="px-4 py-2 border border-gray-300 rounded-lg dark:bg-navy-700 dark:border-navy-600 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                        <option value="suspended">Suspended</option>
                    </select>
                    <button
                        onClick={() => loadData()}
                        className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                    >
                        Filter
                    </button>
                </div>
            </Card>

            {/* Table View (Compact) */}
            <Card extra="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Store</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    </td>
                                </tr>
                            ) : stores.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                        No stores found
                                    </td>
                                </tr>
                            ) : (
                                stores.map(store => (
                                    <tr key={store.id} className={`hover:bg-gray-50 dark:hover:bg-navy-800 ${store.verification_status === 'suspended' ? 'opacity-60' : ''}`}>
                                        {/* Store Info */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                    {store.logo ? (
                                                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <MdStore className="h-5 w-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-navy-700 dark:text-white">{store.name}</div>
                                                    {store.description && <div className="text-xs text-gray-500 truncate max-w-xs">{store.description}</div>}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Owner */}
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {store.owner?.email || 'N/A'}
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-3">
                                            {getStatusBadge(store.verification_status)}
                                            {store.suspension_reason && (
                                                <div className="mt-1 text-xs text-red-600">⚠️ {store.suspension_reason}</div>
                                            )}
                                        </td>

                                        {/* Created Date */}
                                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                            {new Date(store.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                {store.verification_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerify(store.id)}
                                                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium flex items-center gap-1"
                                                            title="Verify Store"
                                                        >
                                                            <MdCheck /> Verify
                                                        </button>
                                                        <button
                                                            onClick={() => setActionModal({ show: true, store, action: 'reject' })}
                                                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium flex items-center gap-1"
                                                            title="Reject Store"
                                                        >
                                                            <MdClose /> Reject
                                                        </button>
                                                    </>
                                                )}
                                                {store.verification_status === 'verified' && (
                                                    <button
                                                        onClick={() => setActionModal({ show: true, store, action: 'suspend' })}
                                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-md text-sm font-medium flex items-center gap-1"
                                                        title="Suspend Store"
                                                    >
                                                        <MdPause /> Suspend
                                                    </button>
                                                )}
                                                {store.verification_status === 'suspended' && (
                                                    <button
                                                        onClick={() => handleUnsuspend(store.id)}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium flex items-center gap-1"
                                                        title="Unsuspend Store"
                                                    >
                                                        <MdPlayArrow /> Unsuspend
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Action Modal */}
            {actionModal.show && actionModal.store && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card extra="max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-navy-700 dark:text-white mb-4">
                            {actionModal.action === 'reject' ? '❌ Reject Store' : '⏸️ Suspend Store'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            <strong>{actionModal.store.name}</strong>
                        </p>
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
                        <div className="flex gap-3">
                            <button
                                onClick={actionModal.action === 'reject' ? handleReject : handleSuspend}
                                disabled={!actionReason.trim()}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setActionModal({ show: false, store: null, action: null });
                                    setActionReason('');
                                }}
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
