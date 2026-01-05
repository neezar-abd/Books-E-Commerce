import { NextResponse } from 'next/server';
import kategoriData from '@/data-kategori-jadi.json';

// Interface untuk kategori data
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kategori = searchParams.get('kategori');
    const subkategori1 = searchParams.get('subkategori1');
    const categoryId = searchParams.get('id');

    // Get category by ID
    if (categoryId) {
      const item = (kategoriData as KategoriItem[]).find(
        (i) => i['id kategori'].toString() === categoryId
      );

      if (item) {
        return NextResponse.json({
          success: true,
          data: {
            id: item['id kategori'],
            name: item.kategori,
            subcategory1: item['kategori-1'],
            subcategory2: item['kategori-2'],
            subcategory3: item['kategori-3'],
            image: item['gbr-1'],
          },
        });
      }
    }

    // Jika tidak ada parameter, return semua kategori utama
    if (!kategori) {
      const allCategories = Array.from(
        new Set(
          (kategoriData as KategoriItem[]).map((item) => item.kategori)
        )
      ).map((cat) => {
        const item = (kategoriData as KategoriItem[]).find(
          (i) => i.kategori === cat
        );
        return {
          name: cat,
          image: item?.['gbr-1'] || '',
          id: item?.['id kategori'],
        };
      });

      return NextResponse.json({
        success: true,
        data: allCategories,
      });
    }

    // Jika ada parameter kategori, return subkategori level 1
    if (kategori && !subkategori1) {
      const subcategories = Array.from(
        new Set(
          (kategoriData as KategoriItem[])
            .filter((item) => item.kategori === kategori && item['kategori-1'])
            .map((item) => item['kategori-1'])
        )
      ).map((subcat) => {
        const item = (kategoriData as KategoriItem[]).find(
          (i) => i.kategori === kategori && i['kategori-1'] === subcat
        );
        return {
          name: subcat,
          image: item?.['gbr-1'] || '',
          kategori: kategori,
          id: item?.['id kategori'],
        };
      });

      return NextResponse.json({
        success: true,
        data: subcategories.filter((s) => s.name),
      });
    }

    // Jika ada kategori dan subkategori1, return subkategori level 2
    if (kategori && subkategori1) {
      const subcategories = Array.from(
        new Set(
          (kategoriData as KategoriItem[])
            .filter(
              (item) =>
                item.kategori === kategori &&
                item['kategori-1'] === subkategori1 &&
                item['kategori-2'] &&
                item['kategori-2'] !== '-'
            )
            .map((item) => item['kategori-2'])
        )
      ).map((subcat) => {
        const item = (kategoriData as KategoriItem[]).find(
          (i) =>
            i.kategori === kategori &&
            i['kategori-1'] === subkategori1 &&
            i['kategori-2'] === subcat
        );
        return {
          name: subcat,
          image: item?.['gbr-1'] || '',
          kategori: kategori,
          subkategori1: subkategori1,
          id: item?.['id kategori'],
        };
      });

      return NextResponse.json({
        success: true,
        data: subcategories.filter((s) => s.name),
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
