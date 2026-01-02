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
        if (!adminId) return;
        try {
            await verifyStore(storeId, adminId);
            showMessage('success', 'Store verified!');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleReject = async () => {
        if (!adminId || !actionModal.store || !actionReason.trim()) return;
        try {
            await rejectStore(actionModal.store.id, adminId, actionReason);
            showMessage('success', 'Store rejected!');
            setActionModal({ show: false, store: null, action: null });
            setActionReason('');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleSuspend = async () => {
        if (!adminId || !actionModal.store || !actionReason.trim()) return;
        try {
            await suspendStore(actionModal.store.id, adminId, actionReason);
            showMessage('success', 'Store suspended!');
            setActionModal({ show: false, store: null, action: null });
            setActionReason('');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const handleUnsuspend = async (storeId: string) => {
        if (!adminId) return;
        try {
            await unsuspendStore(storeId, adminId);
            showMessage('success', 'Store unsuspended!');
            loadData();
        } catch (err: any) {
            showMessage('error', err.message);
        }
    };

    const getStatusBadge = (status: VerificationStatus) => {
        const styles: Record<VerificationStatus, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            verified: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            suspended: 'bg-gray-800 text-white'
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    };

    return (
        <div>
            {/* Message Toast */}
            {message && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Stats Widgets */}
            <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <Widget icon={<MdPending className="h-6 w-6" />} title="Pending" subtitle={stats?.pendingStores || 0} />
                <Widget icon={<MdVerified className="h-6 w-6" />} title="Verified" subtitle={stats?.verifiedStores || 0} />
                <Widget icon={<MdBlock className="h-6 w-6" />} title="Suspended" subtitle={stats?.suspendedStores || 0} />
                <Widget icon={<MdStore className="h-6 w-6" />} title="Total Stores" subtitle={stats?.totalStores || 0} />
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
                            onKeyDown={(e) => e.key === 'Enter' && loadData()}
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
                        <option value="suspended">Suspended</option>
                    </select>
                    <button onClick={loadData} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                        Filter
                    </button>
                </div>
            </Card>

            {/* Stores Grid */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-16">
                        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : stores.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-500">
                        No stores found
                    </div>
                ) : (
                    stores.map(store => (
                        <Card key={store.id} extra={`p-4 ${store.verification_status === 'suspended' ? 'opacity-60' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {store.logo ? (
                                        <img src={store.logo} alt={store.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <MdStore className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-navy-700 dark:text-white truncate">{store.name}</h3>
                                    <p className="text-sm text-gray-500">{store.owner?.email || 'N/A'}</p>
                                    <div className="mt-1">{getStatusBadge(store.verification_status)}</div>
                                </div>
                            </div>

                            {store.suspension_reason && (
                                <div className="mt-3 p-2 bg-red-50 rounded-lg text-sm text-red-600 dark:bg-red-900/20">
                                    ⚠️ {store.suspension_reason}
                                </div>
                            )}

                            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-navy-700">
                                {store.verification_status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleVerify(store.id)}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-600 rounded-lg text-sm hover:bg-green-200"
                                        >
                                            <MdCheck /> Verify
                                        </button>
                                        <button
                                            onClick={() => setActionModal({ show: true, store, action: 'reject' })}
                                            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                                        >
                                            <MdClose /> Reject
                                        </button>
                                    </>
                                )}
                                {store.verification_status === 'verified' && (
                                    <button
                                        onClick={() => setActionModal({ show: true, store, action: 'suspend' })}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900"
                                    >
                                        <MdPause /> Suspend
                                    </button>
                                )}
                                {store.verification_status === 'suspended' && (
                                    <button
                                        onClick={() => handleUnsuspend(store.id)}
                                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                    >
                                        <MdPlayArrow /> Unsuspend
                                    </button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>

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
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setActionModal({ show: false, store: null, action: null })}
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
