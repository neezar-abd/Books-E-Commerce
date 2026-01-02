import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

        console.log('[API Check] Environment check:');
        console.log('[API Check] - URL present:', !!supabaseUrl);
        console.log('[API Check] - Service key present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

        // Get access token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[API Check] No auth token in header');
            return NextResponse.json({ isAdmin: false, error: 'No authorization token' });
        }

        const accessToken = authHeader.replace('Bearer ', '');
        console.log('[API Check] Token received, length:', accessToken.length);

        // Use service role to verify token and get user
        const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceRole) {
            console.error('[API Check] SUPABASE_SERVICE_ROLE_KEY is missing!');
            return NextResponse.json({ isAdmin: false, error: 'Service key not configured' });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);

        // Verify token and get user
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

        console.log('[API Check] User from token:', user?.email, 'Error:', authError?.message);

        if (authError || !user) {
            return NextResponse.json({ isAdmin: false, error: authError?.message || 'Invalid token' });
        }

        // Get user profile with service role (bypasses RLS)
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        console.log('[API Check] Profile query result:', { profile, error: error?.message });

        if (error) {
            console.error('[API Check] Profile error:', error);
            return NextResponse.json({ isAdmin: false, error: error.message });
        }

        const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin';
        console.log('[API Check] Final result - isAdmin:', isAdmin, 'role:', profile?.role);

        return NextResponse.json({
            isAdmin,
            role: profile?.role,
            user_id: user.id,
            email: user.email
        });

    } catch (error: any) {
        console.error('[API Check] Catch error:', error);
        return NextResponse.json({ isAdmin: false, error: error.message });
    }
}
