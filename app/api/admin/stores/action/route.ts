import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function POST(request: NextRequest) {
    try {
        const { storeId, action, reason } = await request.json();

        // Verify user is admin
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || (profile.role !== 'admin' && profile.role !== 'superadmin')) {
            return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
        }

        // Perform action
        let result;
        const timestamp = new Date().toISOString();

        switch (action) {
            case 'verify':
                result = await supabaseAdmin
                    .from('stores')
                    .update({
                        verification_status: 'verified',
                        verification_note: null,
                        verified_at: timestamp,
                        verified_by: user.id,
                        is_active: true
                    })
                    .eq('id', storeId)
                    .select()
                    .single();
                break;

            case 'reject':
                if (!reason?.trim()) {
                    return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
                }
                result = await supabaseAdmin
                    .from('stores')
                    .update({
                        verification_status: 'rejected',
                        verification_note: reason,
                        verified_at: timestamp,
                        verified_by: user.id,
                        is_active: false
                    })
                    .eq('id', storeId)
                    .select()
                    .single();
                break;

            case 'suspend':
                if (!reason?.trim()) {
                    return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
                }
                result = await supabaseAdmin
                    .from('stores')
                    .update({
                        verification_status: 'suspended',
                        suspension_reason: reason,
                        suspended_at: timestamp,
                        suspended_by: user.id,
                        is_active: false
                    })
                    .eq('id', storeId)
                    .select()
                    .single();
                break;

            case 'unsuspend':
                result = await supabaseAdmin
                    .from('stores')
                    .update({
                        verification_status: 'verified',
                        suspension_reason: null,
                        suspended_at: null,
                        suspended_by: null,
                        is_active: true
                    })
                    .eq('id', storeId)
                    .select()
                    .single();
                break;

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        if (result.error) {
            console.error('Store action error:', result.error);
            return NextResponse.json({ error: result.error.message }, { status: 500 });
        }

        // Log audit trail
        await supabaseAdmin.from('admin_audit_log').insert({
            admin_id: user.id,
            action: `${action}_store`,
            resource_type: 'store',
            resource_id: storeId,
            details: reason ? { reason } : null
        });

        return NextResponse.json({
            success: true,
            store: result.data
        });

    } catch (error: any) {
        console.error('API error:', error);
        return NextResponse.json({
            error: error.message || 'Internal server error'
        }, { status: 500 });
    }
}
