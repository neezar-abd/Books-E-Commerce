import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;
        const provinceId = searchParams.get('province_id');
        const provinceSlug = searchParams.get('province_slug');

        let query = supabase
            .from('cities')
            .select(`
        id,
        name,
        type,
        slug,
        province:provinces(id, name, slug)
      `)
            .order('type', { ascending: false })
            .order('name', { ascending: true });

        // Filter by province if provided
        if (provinceId) {
            query = query.eq('province_id', provinceId);
        } else if (provinceSlug) {
            // Join with provinces and filter by slug
            const { data: province } = await supabase
                .from('provinces')
                .select('id')
                .eq('slug', provinceSlug)
                .single();

            if (province) {
                query = query.eq('province_id', province.id);
            }
        }

        const { data: cities, error } = await query;

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: cities || []
        });

    } catch (error: any) {
        console.error('Error fetching cities:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
