import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const searchParams = request.nextUrl.searchParams;

        // Get all provinces
        const { data: provinces, error } = await supabase
            .from('provinces')
            .select('id, name, short_name, slug, zone')
            .order('name', { ascending: true });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: provinces || []
        });

    } catch (error: any) {
        console.error('Error fetching provinces:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
