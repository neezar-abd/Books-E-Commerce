import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const subcategory = searchParams.get('subcategory');
        const search = searchParams.get('search');
        const limit = searchParams.get('limit') || '100';

        let query = supabase
            .from('brands')
            .select('id, name, slug, category_name, subcategory_name')
            .eq('is_active', true)
            .order('name');

        // Filter by category (optional)
        if (category) {
            query = query.eq('category_name', category);
        }

        // Filter by subcategory (optional)
        if (subcategory) {
            query = query.eq('subcategory_name', subcategory);
        }

        // Search by name
        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        // Limit results
        query = query.limit(parseInt(limit));

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching brands:', error);
            return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in brands API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
