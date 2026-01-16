import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function GET() {
  try {
    // Get distinct main categories with their first occurrence data
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('main_category, category_data_id, image1, slug')
      .eq('is_active', true)
      .order('category_data_id');

    if (error) throw error;

    // Group by main_category and get first occurrence
    const mainCategories = new Map();

    data?.forEach((item: any) => {
      if (!mainCategories.has(item.main_category)) {
        const slug = item.main_category
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

        mainCategories.set(item.main_category, {
          id: item.category_data_id,
          name: item.main_category,
          slug: slug,
          icon: '',
          image: item.image1 || `/gambar/banner/kategori/${item.main_category}.png`,
          category_data_id: item.category_data_id,
        });
      }
    });

    const categories = Array.from(mainCategories.values());

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    console.warn('Categories API - table might not exist:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
