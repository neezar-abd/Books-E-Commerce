import { supabase } from './supabase';
import { logAuditAction } from './moderation';

// =============================================
// STORE MANAGEMENT FUNCTIONS
// Fault-tolerant: works even if new columns don't exist
// =============================================

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface ManagedStore {
    id: string;
    name: string;
    description: string;
    logo: string | null;
    banner: string | null;
    verification_status: VerificationStatus;
    verification_note: string | null;
    verified_at: string | null;
    suspension_reason: string | null;
    suspended_at: string | null;
    created_at: string;
    is_active: boolean;
    owner: {
        id: string;
        email: string;
        name: string;
    } | null;
}

// Get pending stores for verification
export async function getPendingStores(): Promise<ManagedStore[]> {
    try {
        // Try with new columns first, no joins
        const { data, error } = await supabase
            .from('stores')
            .select('*')
            .eq('verification_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('New columns not available, falling back:', error.message);
            return [];
        }

        return (data || []).map(s => ({
            ...s,
            owner: null // No join, will be null
        })) as ManagedStore[];
    } catch (e) {
        console.error('Error in getPendingStores:', e);
        return [];
    }
}

// Get all stores with filters
export async function getAllStores(filters?: {
    status?: VerificationStatus | 'all';
    search?: string;
}): Promise<ManagedStore[]> {
    try {
        // Fetch stores without joins to avoid FK errors
        let query = supabase
            .from('stores')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.search) {
            query = query.ilike('name', `%${filters.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching stores:', error.message);
            return [];
        }

        // Map to add default verification fields if they don't exist
        return (data || []).map(s => ({
            ...s,
            verification_status: (s as any).verification_status || 'verified',
            verification_note: (s as any).verification_note || null,
            verified_at: (s as any).verified_at || null,
            suspension_reason: (s as any).suspension_reason || null,
            suspended_at: (s as any).suspended_at || null,
            owner: null // Will be null since we can't join
        })) as ManagedStore[];
    } catch (e) {
        console.error('Error in getAllStores:', e);
        return [];
    }
}

// Verify a store
export async function verifyStore(storeId: string, adminId: string): Promise<void> {
    const { error } = await supabase
        .from('stores')
        .update({
            verification_status: 'verified',
            verification_note: null,
            verified_at: new Date().toISOString(),
            is_active: true
        })
        .eq('id', storeId);

    if (error) {
        console.error('Error verifying store:', error);
        throw error;
    }

    await logAuditAction(adminId, 'verify_store', 'store', storeId);
}

// Reject a store
export async function rejectStore(storeId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
        .from('stores')
        .update({
            verification_status: 'rejected',
            verification_note: reason,
            is_active: false
        })
        .eq('id', storeId);

    if (error) {
        console.error('Error rejecting store:', error);
        throw error;
    }

    await logAuditAction(adminId, 'reject_store', 'store', storeId, { reason });
}

// Suspend a store
export async function suspendStore(storeId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
        .from('stores')
        .update({
            verification_status: 'suspended',
            suspension_reason: reason,
            suspended_at: new Date().toISOString(),
            is_active: false
        })
        .eq('id', storeId);

    if (error) {
        console.error('Error suspending store:', error);
        throw error;
    }

    // Also set all products from this store to inactive
    await supabase
        .from('products')
        .update({ is_active: false })
        .eq('store_id', storeId);

    await logAuditAction(adminId, 'suspend_store', 'store', storeId, { reason });
}

// Unsuspend a store
export async function unsuspendStore(storeId: string, adminId: string): Promise<void> {
    const { error } = await supabase
        .from('stores')
        .update({
            verification_status: 'verified',
            suspension_reason: null,
            suspended_at: null,
            is_active: true
        })
        .eq('id', storeId);

    if (error) {
        console.error('Error unsuspending store:', error);
        throw error;
    }

    // Reactivate products
    await supabase
        .from('products')
        .update({ is_active: true })
        .eq('store_id', storeId);

    await logAuditAction(adminId, 'unsuspend_store', 'store', storeId);
}

// =============================================
// STORE STATS
// =============================================

export interface StoreStats {
    pendingStores: number;
    verifiedStores: number;
    suspendedStores: number;
    totalStores: number;
}

export async function getStoreStats(): Promise<StoreStats> {
    try {
        // Just get total count - verification_status may not exist
        const { count: totalCount } = await supabase
            .from('stores')
            .select('*', { count: 'exact', head: true });

        // Try to get verification-based stats, but don't fail if column doesn't exist
        let pendingCount = 0;
        let verifiedCount = totalCount || 0; // Default all to verified
        let suspendedCount = 0;

        try {
            const [pending, verified, suspended] = await Promise.all([
                supabase.from('stores').select('*', { count: 'exact', head: true }).eq('verification_status', 'pending'),
                supabase.from('stores').select('*', { count: 'exact', head: true }).eq('verification_status', 'verified'),
                supabase.from('stores').select('*', { count: 'exact', head: true }).eq('verification_status', 'suspended'),
            ]);

            if (!pending.error) pendingCount = pending.count || 0;
            if (!verified.error) verifiedCount = verified.count || 0;
            if (!suspended.error) suspendedCount = suspended.count || 0;
        } catch (e) {
            // Columns don't exist yet, use defaults
        }

        return {
            pendingStores: pendingCount,
            verifiedStores: verifiedCount,
            suspendedStores: suspendedCount,
            totalStores: totalCount || 0
        };
    } catch (e) {
        console.error('Error getting store stats:', e);
        return {
            pendingStores: 0,
            verifiedStores: 0,
            suspendedStores: 0,
            totalStores: 0
        };
    }
}

// Get store details with product/order counts
export async function getStoreDetails(storeId: string): Promise<any> {
    const { data: store, error } = await supabase
        .from('stores')
        .select(`
            *,
            profiles:owner_id (id, email, name, phone)
        `)
        .eq('id', storeId)
        .single();

    if (error) {
        console.error('Error fetching store details:', error);
        throw error;
    }

    // Get product count
    const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeId);

    return {
        ...store,
        owner: Array.isArray(store.profiles) ? store.profiles[0] : store.profiles,
        _count: {
            products: productCount || 0
        }
    };
}
