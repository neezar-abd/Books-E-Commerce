'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  image?: string;
}

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      
      // Try to get main categories from database
      const response = await fetch('/api/categories-main');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.length > 0) {
          setCategories(result.data);
          setLoading(false);
          return;
        }
      }
      
      // Fallback: use Supabase
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // ALL categories with CORRECT IDs from data-kategori-jadi.json
  const fallbackCategories = [
    { name: 'Pakaian Wanita', slug: 'pakaian-wanita', image: '/gambar/banner/kategori/pakaian wanita.png', catId: '100350' },
    { name: 'Pakaian Pria', slug: 'pakaian-pria', image: '/gambar/banner/kategori/pakaian pria.png', catId: '100047' },
    { name: 'Ponsel & Aksesoris', slug: 'ponsel-aksesoris', image: '/gambar/banner/kategori/handphone aksesoris.png', catId: '100071' },
    { name: 'Komputer & Aksesoris', slug: 'komputer-aksesoris', image: '/gambar/banner/kategori/komputer aksesoris.png', catId: '101944' },
    { name: 'Buku & Alat Tulis', slug: 'buku-alat-tulis', image: '/gambar/banner/kategori/Buku & Alat Tulis.png', catId: '101330' },
    { name: 'Aksesoris Mode', slug: 'aksesoris-mode', image: '/gambar/banner/kategori/aksesoris fashion.png', catId: '100021' },
    { name: 'Fashion Bayi & Anak', slug: 'fashion-bayi-anak', image: '/gambar/banner/kategori/fashion bayi dan anak.png', catId: '101016' },
    { name: 'Mode Muslim', slug: 'mode-muslim', image: '/gambar/banner/kategori/fashion muslim.png', catId: '100492' },
    { name: 'Kamera & Drone', slug: 'kamera-drone', image: '/gambar/banner/kategori/fotografi.png', catId: '101092' },
    { name: 'Hobi & Koleksi', slug: 'hobi-koleksi', image: '/gambar/banner/kategori/hobi dan koleksi.png', catId: '101385' },
    { name: 'Ibu & Bayi', slug: 'ibu-bayi', image: '/gambar/banner/kategori/ibu dan bayi.png', catId: '100945' },
    { name: 'Jam Tangan', slug: 'jam-tangan', image: '/gambar/banner/kategori/jam tangan.png', catId: '100573' },
    { name: 'Kesehatan', slug: 'kesehatan', image: '/gambar/banner/kategori/kesehatan.png', catId: '100003' },
    { name: 'Makanan & Minuman', slug: 'makanan-minuman', image: '/gambar/banner/kategori/makanan dan minuman.png', catId: '100780' },
    { name: 'Olahraga & Aktivitas Luar Ruangan', slug: 'olahraga-outdoor', image: '/gambar/banner/kategori/olahraga dan outdoor.png', catId: '101816' },
    { name: 'Sepeda Motor', slug: 'sepeda-motor', image: '/gambar/banner/kategori/otomotif.png', catId: '100755' },
    { name: 'Perawatan & Kecantikan', slug: 'perawatan-kecantikan', image: '/gambar/banner/kategori/perawatan dan kecantikan.png', catId: '101607' },
    { name: 'Perlengkapan Rumah', slug: 'perlengkapan-rumah', image: '/gambar/banner/kategori/perlengkapan rumah.png', catId: '101127' },
    { name: 'Sepatu Pria', slug: 'sepatu-pria', image: '/gambar/banner/kategori/sepatu pria.png', catId: '100255' },
    { name: 'Sepatu Wanita', slug: 'sepatu-wanita', image: '/gambar/banner/kategori/sepatu wanita.png', catId: '100585' },
    { name: 'Tas Pria', slug: 'tas-pria', image: '/gambar/banner/kategori/tas pria.png', catId: '100564' },
    { name: 'Tas Wanita', slug: 'tas-wanita', image: '/gambar/banner/kategori/tas wanita.png', catId: '100089' },
    { name: 'Koper & Tas Travel', slug: 'koper-tas-travel', image: '/gambar/banner/kategori/souvenir dan perlengkapan.png', catId: '100320' },
    { name: 'Elektronik', slug: 'elektronik', image: '/gambar/banner/kategori/voucher.png', catId: '100168' },
  ];

  const displayCategories = categories.length > 0 ? categories : fallbackCategories;

  return (
    <section className="py-6 bg-white" id="categories">
      <div className="container-80">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">KATEGORI</h2>
          <Link href="/products" className="text-sm text-secondary hover:underline">
            Lihat Semua
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-2 animate-pulse">
                <div className="w-14 h-14 rounded-xl bg-gray-200" />
                <div className="w-12 h-2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
            {displayCategories.map((category) => {
              const imagePath = category.image || `/gambar/banner/kategori/${category.name}.png`;
              const categorySlug = category.slug || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const categoryId = category.category_data_id || category.catId || category.id;

              return (
                <Link
                  key={category.slug || category.name}
                  href={`/${categorySlug}-cat.${categoryId}`}
                  className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-surface transition-all group cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-white shadow-sm group-hover:scale-105 transition-transform">
                    <Image
                      src={imagePath}
                      alt={category.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] text-center text-primary font-medium leading-tight line-clamp-2">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Categories;
