import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// Server-side moderation actions (bypasses RLS)
export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseServiceRole) {
            return NextResponse.json({ success: false, error: 'Service key not configured' }, { status: 500 });
        }

        const body = await request.json();
        const { action, productId, reason, adminId } = body;

        if (!action || !productId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

        let updateData: any = {
            moderated_at: new Date().toISOString(),
            moderated_by: adminId
        };

        switch (action) {
            case 'approve':
                updateData.moderation_status = 'approved';
                updateData.moderation_note = null;
                updateData.is_flagged = false;
                updateData.flagged_reason = null;
                updateData.is_active = true;
                break;
            case 'reject':
                updateData.moderation_status = 'rejected';
                updateData.moderation_note = reason;
                updateData.is_active = false;
                break;
            case 'block':
                updateData.moderation_status = 'blocked';
                updateData.moderation_note = reason;
                updateData.is_active = false;
                break;
            case 'unflag':
                updateData.is_flagged = false;
                updateData.flagged_reason = null;
                break;
            default:
                return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
        }

        console.log('[Moderation API] Updating product:', productId, 'Action:', action, 'Data:', updateData);

        const { data, error } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', productId)
            .select();

        if (error) {
            console.error('[Moderation API] Error:', error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        console.log('[Moderation API] Update result:', data);

        // Log audit
        if (adminId) {
            try {
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('email')
                    .eq('id', adminId)
                    .single();

                await supabaseAdmin
                    .from('audit_logs')
                    .insert({
                        admin_id: adminId,
                        admin_email: profile?.email,
                        action: `${action}_product`,
                        target_type: 'product',
                        target_id: productId,
                        details: reason ? { reason } : null
                    });
            } catch (e) {
                console.error('[Moderation API] Audit log error:', e);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Product ${action}ed successfully`,
            data
        });

    } catch (error: any) {
        console.error('[Moderation API] Catch error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
