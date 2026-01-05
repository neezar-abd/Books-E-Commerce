import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import kategoriData from '@/data-kategori-jadi.json';

// Server-side Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

interface KategoriItem {
  kategori: string;
  'kategori-1'?: string;
  'kategori-2'?: string;
  'kategori-3'?: string;
  'kategori-4'?: string;
  'id kategori': number;
  'gbr-1'?: string;
  'gbr-2'?: string;
  'gbr-3'?: string;
  '4'?: string;
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action === 'sync') {
      // Clear existing categories first (optional)
      const shouldClear = false; // Set to true if you want to clear first
      if (shouldClear) {
        await supabaseAdmin.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      }

      const categories = kategoriData as KategoriItem[];
      
      // Deduplicate by category_data_id - keep only first occurrence
      const uniqueCategories = Array.from(
        new Map(
          categories.map(item => [item['id kategori'], item])
        ).values()
      );
      
      let successCount = 0;
      let errorCount = 0;
      const errors: any[] = [];

      // Insert categories one by one to avoid conflicts
      for (let i = 0; i < uniqueCategories.length; i++) {
        const item = uniqueCategories[i];
        
        // Generate slug from category hierarchy
        const slugParts = [
          item.kategori,
          item['kategori-1'],
          item['kategori-2'],
          item['kategori-3'],
        ]
          .filter((part) => part && part !== '-')
          .map((part) =>
            part!
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '')
          );

        const slug = slugParts.join('-');
        const name = slugParts.join(' > ');

        const record = {
          category_data_id: item['id kategori'],
          name: name,
          slug: slug,
          main_category: item.kategori,
          sub1: item['kategori-1'] || null,
          sub2: item['kategori-2'] === '-' ? null : item['kategori-2'],
          sub3: item['kategori-3'] === '-' ? null : item['kategori-3'],
          sub4: item['kategori-4'] === '-' ? null : item['kategori-4'],
          image1: item['gbr-1'] || null,
          image2: item['gbr-2'] || null,
          image3: item['gbr-3'] || null,
          image4: item['4'] || null,
          image: item['gbr-1'] || null,
          is_active: true,
          position: item['id kategori'],
        };

        const { error } = await supabaseAdmin
          .from('categories')
          .upsert(record, { 
            onConflict: 'category_data_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error(`Item ${i + 1} error:`, error);
          errorCount++;
          errors.push({ index: i + 1, categoryId: item['id kategori'], error: error.message });
        } else {
          successCount++;
        }
        
        // Log progress every 100 items
        if ((i + 1) % 100 === 0) {
          console.log(`Progress: ${i + 1}/${uniqueCategories.length}`);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Category sync completed',
        stats: {
          total: uniqueCategories.length,
          success: successCount,
          errors: errorCount,
          errorDetails: errors.slice(0, 10), // Only return first 10 errors
        },
      });
    }

    if (action === 'count') {
      const { count: jsonCount } = { count: kategoriData.length };
      
      const { count: dbCount, error } = await supabaseAdmin
        .from('categories')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        counts: {
          json: jsonCount,
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
