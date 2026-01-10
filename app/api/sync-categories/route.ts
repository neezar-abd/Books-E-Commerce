import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'sync') {
      return NextResponse.json({
        success: false,
        error: 'Category data is already in database. Please use the sync-categories.js script to import new data.',
      }, { status: 400 });
    }

    if (action === 'count') {
      const { count: dbCount, error } = await supabaseAdmin
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        counts: {
          database: dbCount || 0,
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error syncing categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync categories',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategory = searchParams.get('main');
    const sub1 = searchParams.get('sub1');
    const dataId = searchParams.get('id');

    let query = supabaseAdmin.from('categories').select('*');

    if (dataId) {
      query = query.eq('category_data_id', parseInt(dataId));
    } else if (mainCategory) {
      query = query.eq('main_category', mainCategory);
      if (sub1) {
        query = query.eq('sub1', sub1);
      }
    } else {
      // Return all if no filter
      query = query.limit(1000);
    }

    const { data, error } = await query.order('category_data_id');

    if (error) throw error;

    console.log(`GET categories - ID: ${dataId}, Main: ${mainCategory}, Results: ${data?.length || 0}`);

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
