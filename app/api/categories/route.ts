import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    const subkategori1 = searchParams.get('subkategori1');
    const categoryId = searchParams.get('id');

    // Get category by ID
    if (categoryId) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('category_data_id', parseInt(categoryId))
        .single();

      if (error) throw error;

      if (data) {
        return NextResponse.json({
          success: true,
          data: {
            id: data.category_data_id,
            name: data.main_category,
            subcategory1: data.sub1,
            subcategory2: data.sub2,
            subcategory3: data.sub3,
            image: data.image,
          },
        });
      }
    }

    // Return all main categories
    if (!kategori) {
      const { data, error } = await supabase
        .from('categories')
        .select('main_category, image, category_data_id')
        .order('category_data_id');

      if (error) throw error;

      // Get unique main categories
      const uniqueCategories = Array.from(
        new Map(
          data.map(item => [item.main_category, item])
        ).values()
      );

      const allCategories = uniqueCategories.map(cat => ({
        name: cat.main_category,
        image: cat.image || '',
        id: cat.category_data_id,
      }));

      return NextResponse.json({
        success: true,
        data: allCategories,
      });
    }

    // Return subcategories level 1
    if (kategori && !subkategori1) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('main_category', kategori)
        .not('sub1', 'is', null);

      if (error) throw error;

      // Get unique sub1 values
      const uniqueSub1 = Array.from(
        new Map(
          data.map(item => [item.sub1, item])
        ).values()
      );

      const subcategories = uniqueSub1.map(item => ({
        name: item.sub1,
        image: item.image || '',
        kategori: kategori,
        id: item.category_data_id,
      })).filter(s => s.name);

      return NextResponse.json({
        success: true,
        data: subcategories,
      });
    }

    // Return subcategories level 2
    if (kategori && subkategori1) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('main_category', kategori)
        .eq('sub1', subkategori1)
        .not('sub2', 'is', null);

      if (error) throw error;

      // Get unique sub2 values and filter out '-'
      const uniqueSub2 = Array.from(
        new Map(
          data.filter(item => item.sub2 && item.sub2 !== '-')
            .map(item => [item.sub2, item])
        ).values()
      );

      const subcategories = uniqueSub2.map(item => ({
        name: item.sub2,
        image: item.image || '',
        kategori: kategori,
        subkategori1: subkategori1,
        id: item.category_data_id,
      })).filter(s => s.name);

      return NextResponse.json({
        success: true,
        data: subcategories,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
