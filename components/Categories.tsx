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
    // Temporarily disabled - use fallback categories
    // const fetchCategories = async () => {
    //   try {
    //     const { data, error } = await supabase
    //       .from('categories')
    //       .select('*')
    //       .eq('is_active', true)
    //       .order('position', { ascending: true });

    //     if (!error && data) {
    //       setCategories(data);
    //     }
    //   } catch (err) {
    //     console.error('Error fetching categories:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchCategories();
    setLoading(false); // Use fallback
  }, []);

  // ALL 24 categories with local images
  const fallbackCategories = [
    { name: 'Buku & Alat Tulis', slug: 'buku-alat-tulis', image: '/gambar/banner/kategori/Buku & Alat Tulis.png' },
    { name: 'Aksesoris Fashion', slug: 'aksesoris-fashion', image: '/gambar/banner/kategori/aksesoris fashion.png' },
    { name: 'Fashion Bayi & Anak', slug: 'fashion-bayi-anak', image: '/gambar/banner/kategori/fashion bayi dan anak.png' },
    { name: 'Fashion Muslim', slug: 'fashion-muslim', image: '/gambar/banner/kategori/fashion muslim.png' },
    { name: 'Fotografi', slug: 'fotografi', image: '/gambar/banner/kategori/fotografi.png' },
    { name: 'Handphone & Aksesoris', slug: 'handphone', image: '/gambar/banner/kategori/handphone aksesoris.png' },
    { name: 'Hobi & Koleksi', slug: 'hobi-koleksi', image: '/gambar/banner/kategori/hobi dan koleksi.png' },
    { name: 'Ibu & Bayi', slug: 'ibu-bayi', image: '/gambar/banner/kategori/ibu dan bayi.png' },
    { name: 'Jam Tangan', slug: 'jam-tangan', image: '/gambar/banner/kategori/jam tangan.png' },
    { name: 'Kesehatan', slug: 'kesehatan', image: '/gambar/banner/kategori/kesehatan.png' },
    { name: 'Komputer & Aksesoris', slug: 'komputer', image: '/gambar/banner/kategori/komputer aksesoris.png' },
    { name: 'Makanan & Minuman', slug: 'makanan-minuman', image: '/gambar/banner/kategori/makanan dan minuman.png' },
    { name: 'Olahraga & Outdoor', slug: 'olahraga-outdoor', image: '/gambar/banner/kategori/olahraga dan outdoor.png' },
    { name: 'Otomotif', slug: 'otomotif', image: '/gambar/banner/kategori/otomotif.png' },
    { name: 'Pakaian Pria', slug: 'pakaian-pria', image: '/gambar/banner/kategori/pakaian pria.png' },
    { name: 'Pakaian Wanita', slug: 'pakaian-wanita', image: '/gambar/banner/kategori/pakaian wanita.png' },
    { name: 'Perawatan & Kecantikan', slug: 'perawatan-kecantikan', image: '/gambar/banner/kategori/perawatan dan kecantikan.png' },
    { name: 'Perlengkapan Rumah', slug: 'perlengkapan-rumah', image: '/gambar/banner/kategori/perlengkapan rumah.png' },
    { name: 'Sepatu Pria', slug: 'sepatu-pria', image: '/gambar/banner/kategori/sepatu pria.png' },
    { name: 'Sepatu Wanita', slug: 'sepatu-wanita', image: '/gambar/banner/kategori/sepatu wanita.png' },
    { name: 'Souvenir & Perlengkapan', slug: 'souvenir', image: '/gambar/banner/kategori/souvenir dan perlengkapan.png' },
    { name: 'Tas Pria', slug: 'tas-pria', image: '/gambar/banner/kategori/tas pria.png' },
    { name: 'Tas Wanita', slug: 'tas-wanita', image: '/gambar/banner/kategori/tas wanita.png' },
    { name: 'Voucher', slug: 'voucher', image: '/gambar/banner/kategori/voucher.png' },
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

              return (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
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
