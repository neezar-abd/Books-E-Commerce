import { supabase } from './supabase';

// =============================================
// PRODUCT MODERATION FUNCTIONS
// =============================================

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'blocked';

export interface ModerationProduct {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string[];
    moderation_status: ModerationStatus;
    moderation_note: string | null;
    moderated_at: string | null;
    is_flagged: boolean;
    flagged_reason: string | null;
    created_at: string;
    store: {
        id: string;
        name: string;
        owner_id: string;
    };
    categories: {
        name: string;
    };
}

// Get pending products for moderation
export async function getPendingProducts(): Promise<ModerationProduct[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id, title, description, price, images, is_active, created_at,
                moderation_status, moderation_note, moderated_at,
                is_flagged, flagged_reason,
                stores:store_id (id, name, owner_id),
                categories:category_id (name)
            `)
            .eq('moderation_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Moderation columns may not exist yet:', error.message);
            return [];
        }

        return (data || []).map(p => ({
            ...p,
            store: Array.isArray(p.stores) ? p.stores[0] : p.stores,
            categories: Array.isArray(p.categories) ? p.categories[0] : p.categories
        })) as ModerationProduct[];
    } catch (e) {
        console.error('Error in getPendingProducts:', e);
        return [];
    }
}

// Get flagged products
export async function getFlaggedProducts(): Promise<ModerationProduct[]> {
    try {
        const { data, error } = await supabase
            .from('products')
            .select(`
                id, title, description, price, images, is_active, created_at,
                moderation_status, moderation_note, moderated_at,
                is_flagged, flagged_reason,
                stores:store_id (id, name, owner_id),
                categories:category_id (name)
            `)
            .eq('is_flagged', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.warn('Flagged columns may not exist:', error.message);
            return [];
        }

        return (data || []).map(p => ({
            ...p,
            store: Array.isArray(p.stores) ? p.stores[0] : p.stores,
            categories: Array.isArray(p.categories) ? p.categories[0] : p.categories
        })) as ModerationProduct[];
    } catch (e) {
        console.error('Error in getFlaggedProducts:', e);
        return [];
    }
}

// Get all products with filters for moderation
export async function getAllProductsForModeration(filters?: {
    status?: ModerationStatus | 'all';
    search?: string;
    storeId?: string;
    flaggedOnly?: boolean;
}): Promise<ModerationProduct[]> {
    try {
        // Try basic query first
        let query = supabase
            .from('products')
            .select(`
                id, title, description, price, images, is_active, created_at,
                stores:store_id (id, name, owner_id),
                categories:category_id (name)
            `)
            .order('created_at', { ascending: false });

        if (filters?.search) {
            query = query.ilike('title', `%${filters.search}%`);
        }

        if (filters?.storeId) {
            query = query.eq('store_id', filters.storeId);
        }

        const { data, error } = await query;

        if (error) {
            console.warn('Error fetching products:', error.message);
            return [];
        }

        // Map with default moderation values
        return (data || []).map(p => ({
            ...p,
            moderation_status: (p as any).moderation_status || 'approved',
            moderation_note: (p as any).moderation_note || null,
            moderated_at: (p as any).moderated_at || null,
            is_flagged: (p as any).is_flagged || false,
            flagged_reason: (p as any).flagged_reason || null,
            store: Array.isArray(p.stores) ? p.stores[0] : p.stores,
            categories: Array.isArray(p.categories) ? p.categories[0] : p.categories
        })) as ModerationProduct[];
    } catch (e) {
        console.error('Error in getAllProductsForModeration:', e);
        return [];
    }
}

// Approve a product
export async function approveProduct(productId: string, adminId: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .update({
            moderation_status: 'approved',
            moderation_note: null,
            moderated_at: new Date().toISOString(),
            moderated_by: adminId,
            is_flagged: false,
            flagged_reason: null
        })
        .eq('id', productId);

    if (error) {
        console.error('Error approving product:', error);
        throw error;
    }

    // Log action
    await logAuditAction(adminId, 'approve_product', 'product', productId);
}

// Reject a product
export async function rejectProduct(productId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .update({
            moderation_status: 'rejected',
            moderation_note: reason,
            moderated_at: new Date().toISOString(),
            moderated_by: adminId,
            is_active: false
        })
        .eq('id', productId);

    if (error) {
        console.error('Error rejecting product:', error);
        throw error;
    }

    // Log action
    await logAuditAction(adminId, 'reject_product', 'product', productId, { reason });
}

// Block a product (severe violation)
export async function blockProduct(productId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .update({
            moderation_status: 'blocked',
            moderation_note: reason,
            moderated_at: new Date().toISOString(),
            moderated_by: adminId,
            is_active: false
        })
        .eq('id', productId);

    if (error) {
        console.error('Error blocking product:', error);
        throw error;
    }

    // Log action
    await logAuditAction(adminId, 'block_product', 'product', productId, { reason });
}

// Unflag a product (false positive)
export async function unflagProduct(productId: string, adminId: string): Promise<void> {
    const { error } = await supabase
        .from('products')
        .update({
            is_flagged: false,
            flagged_reason: null
        })
        .eq('id', productId);

    if (error) {
        console.error('Error unflagging product:', error);
        throw error;
    }

    // Log action
    await logAuditAction(adminId, 'unflag_product', 'product', productId);
}

// =============================================
// BANNED KEYWORDS & AUTO-FLAGGING
// =============================================

interface BannedKeyword {
    id: string;
    keyword: string;
    severity: 'warning' | 'block' | 'report';
}

// Get all banned keywords
export async function getBannedKeywords(): Promise<BannedKeyword[]> {
    const { data, error } = await supabase
        .from('banned_keywords')
        .select('*')
        .order('keyword', { ascending: true });

    if (error) {
        console.error('Error fetching banned keywords:', error);
        throw error;
    }

    return data || [];
}

// Add banned keyword
export async function addBannedKeyword(keyword: string, severity: 'warning' | 'block' | 'report', adminId: string): Promise<void> {
    const { error } = await supabase
        .from('banned_keywords')
        .insert({
            keyword: keyword.toLowerCase().trim(),
            severity,
            created_by: adminId
        });

    if (error) {
        console.error('Error adding banned keyword:', error);
        throw error;
    }

    await logAuditAction(adminId, 'add_banned_keyword', 'settings', null, { keyword, severity });
}

// Remove banned keyword
export async function removeBannedKeyword(keywordId: string, adminId: string): Promise<void> {
    const { error } = await supabase
        .from('banned_keywords')
        .delete()
        .eq('id', keywordId);

    if (error) {
        console.error('Error removing banned keyword:', error);
        throw error;
    }

    await logAuditAction(adminId, 'remove_banned_keyword', 'settings', keywordId);
}

// Check content against banned keywords
export async function checkForBannedKeywords(text: string): Promise<{
    hasBannedKeyword: boolean;
    matches: { keyword: string; severity: string }[];
}> {
    const keywords = await getBannedKeywords();
    const lowerText = text.toLowerCase();
    const matches: { keyword: string; severity: string }[] = [];

    for (const kw of keywords) {
        if (lowerText.includes(kw.keyword.toLowerCase())) {
            matches.push({ keyword: kw.keyword, severity: kw.severity });
        }
    }

    return {
        hasBannedKeyword: matches.length > 0,
        matches
    };
}

// Auto-flag product if contains banned keywords  
export async function autoFlagProduct(productId: string, title: string, description: string): Promise<boolean> {
    const contentToCheck = `${title} ${description}`;
    const { hasBannedKeyword, matches } = await checkForBannedKeywords(contentToCheck);

    if (hasBannedKeyword) {
        // Find the most severe match
        const blocked = matches.find(m => m.severity === 'block');
        const reported = matches.find(m => m.severity === 'report');

        let flag_reason = `Auto-flagged: Contains banned keywords (${matches.map(m => m.keyword).join(', ')})`;
        let newStatus: ModerationStatus = 'pending';

        // If contains blocked keyword, set to pending immediately
        if (blocked) {
            newStatus = 'pending';
        }

        await supabase
            .from('products')
            .update({
                is_flagged: true,
                flagged_reason: flag_reason,
                moderation_status: newStatus
            })
            .eq('id', productId);

        return true;
    }

    return false;
}

// =============================================
// MODERATION STATS
// =============================================

export interface ModerationStats {
    pendingProducts: number;
    flaggedProducts: number;
    approvedToday: number;
    rejectedToday: number;
    blockedTotal: number;
}

export async function getModerationStats(): Promise<ModerationStats> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayISO = today.toISOString();

        // These queries may fail if columns don't exist, that's OK
        let pendingCount = 0, flaggedCount = 0, approvedCount = 0, rejectedCount = 0, blockedCount = 0;

        try {
            const [pending, flagged, approvedToday, rejectedToday, blocked] = await Promise.all([
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending'),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_flagged', true),
                supabase.from('products').select('*', { count: 'exact', head: true })
                    .eq('moderation_status', 'approved')
                    .gte('moderated_at', todayISO),
                supabase.from('products').select('*', { count: 'exact', head: true })
                    .eq('moderation_status', 'rejected')
                    .gte('moderated_at', todayISO),
                supabase.from('products').select('*', { count: 'exact', head: true }).eq('moderation_status', 'blocked'),
            ]);

            if (!pending.error) pendingCount = pending.count || 0;
            if (!flagged.error) flaggedCount = flagged.count || 0;
            if (!approvedToday.error) approvedCount = approvedToday.count || 0;
            if (!rejectedToday.error) rejectedCount = rejectedToday.count || 0;
            if (!blocked.error) blockedCount = blocked.count || 0;
        } catch (e) {
            // Columns don't exist yet, use zeros
        }

        return {
            pendingProducts: pendingCount,
            flaggedProducts: flaggedCount,
            approvedToday: approvedCount,
            rejectedToday: rejectedCount,
            blockedTotal: blockedCount
        };
    } catch (e) {
        console.error('Error getting moderation stats:', e);
        return {
            pendingProducts: 0,
            flaggedProducts: 0,
            approvedToday: 0,
            rejectedToday: 0,
            blockedTotal: 0
        };
    }
}

// =============================================
// AUDIT LOGGING
// =============================================

export async function logAuditAction(
    adminId: string,
    action: string,
    targetType: string,
    targetId: string | null,
    details?: Record<string, any>
): Promise<void> {
    try {
        // Get admin email for logging
        const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', adminId)
            .single();

        await supabase
            .from('audit_logs')
            .insert({
                admin_id: adminId,
                admin_email: profile?.email,
                action,
                target_type: targetType,
                target_id: targetId,
                details: details || null
            });
    } catch (error) {
        console.error('Error logging audit action:', error);
        // Don't throw - audit logging should not break main flow
    }
}

// Get audit logs
export async function getAuditLogs(limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching audit logs:', error);
        throw error;
    }

    return data || [];
}
