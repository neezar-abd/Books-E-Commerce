import { supabase } from './supabase';

// Types
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface ManagedStore {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    logo: string | null;
    verification_status: VerificationStatus;
    verification_note: string | null;
    suspension_reason: string | null;
    is_active: boolean;
    created_at: string;
    verified_at: string | null;
    verified_by: string | null;
    owner?: {
        id: string;
        email: string;
    };
}

export interface StoreStats {
    pendingStores: number;
    verifiedStores: number;
    suspendedStores: number;
    totalStores: number;
}

// Get user's auth token for API calls
async function getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
}

// Call admin API endpoint
async function callAdminAPI(action: string, storeId: string, reason?: string) {
    const token = await getAuthToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch('/api/admin/stores/action', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ storeId, action, reason })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// Get all stores with optional filters
export async function getAllStores(filters?: {
    status?: VerificationStatus | 'all';
    search?: string;
}): Promise<ManagedStore[]> {
    try {
        let query = supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('verification_status', filters.status);
        }

        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        const { data: stores, error } = await query;

        if (error) {
            console.error('[getAllStores] Error fetching stores:', error);
            throw error;
        }

        if (!stores || stores.length === 0) {
            return [];
        }

        // Fetch owner emails separately
        const ownerIds = [...new Set(stores.map(s => s.owner_id).filter(Boolean))];
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', ownerIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        // Combine data
        return stores.map(store => ({
            ...store as any,
            owner: store.owner_id ? profileMap.get(store.owner_id) : null
        }));
    } catch (error) {
        console.error('[getAllStores] Exception:', error);
        throw error;
    }
}

// Get store statistics
export async function getStoreStats(): Promise<StoreStats> {
    try {
        const { data, error } = await supabase
            .from('stores')
            .select('verification_status');

        if (error) {
            console.error('[getStoreStats] Error:', error);
            throw error;
        }

        const stats = {
            pendingStores: 0,
            verifiedStores: 0,
            suspendedStores: 0,
            totalStores: data?.length || 0
        };

        data?.forEach(store => {
            if (store.verification_status === 'pending') stats.pendingStores++;
            else if (store.verification_status === 'verified') stats.verifiedStores++;
            else if (store.verification_status === 'suspended') stats.suspendedStores++;
        });

        return stats;
    } catch (error) {
        console.error('[getStoreStats] Exception:', error);
        // Return empty stats on error
        return {
            pendingStores: 0,
            verifiedStores: 0,
            suspendedStores: 0,
            totalStores: 0
        };
    }
}

// Verify a store (via API)
export async function verifyStore(storeId: string, adminId: string): Promise<void> {
    console.log('[verifyStore] Calling API:', { storeId, adminId });
    await callAdminAPI('verify', storeId);
}

// Reject a store (via API)
export async function rejectStore(storeId: string, adminId: string, reason: string): Promise<void> {
    await callAdminAPI('reject', storeId, reason);
}

// Suspend a store (via API)
export async function suspendStore(storeId: string, adminId: string, reason: string): Promise<void> {
    await callAdminAPI('suspend', storeId, reason);
}

// Unsuspend a store (via API)
export async function unsuspendStore(storeId: string, adminId: string): Promise<void> {
    await callAdminAPI('unsuspend', storeId);
}

// Log audit action (client-side - just for compatibility)
async function logAuditAction(adminId: string, action: string, resourceType: string, resourceId: string, details?: any) {
    // Audit logging now handled by API route
    console.log('[Audit]', { adminId, action, resourceType, resourceId, details });
}
