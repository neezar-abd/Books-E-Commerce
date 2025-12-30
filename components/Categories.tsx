'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Shirt, Heart, Home, UtensilsCrossed, Dumbbell, Gamepad2, Car, BookOpen, ShoppingBag, Sparkles, Tag } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

// Icon mapping based on category name/icon field
const iconMap: { [key: string]: React.ElementType } = {
  'Smartphone': Smartphone,
  'Shirt': Shirt,
  'ShoppingBag': ShoppingBag,
  'Heart': Heart,
  'Home': Home,
  'Coffee': UtensilsCrossed,
  'Dumbbell': Dumbbell,
  'Gamepad2': Gamepad2,
  'Car': Car,
  'BookOpen': BookOpen,
  'Sparkles': Sparkles,
  'Tag': Tag,
};

const colorMap: { [key: string]: string } = {
  'elektronik': 'bg-blue-50 text-blue-600',
  'fashion-pria': 'bg-indigo-50 text-indigo-600',
  'fashion-wanita': 'bg-pink-50 text-pink-600',
  'kesehatan-kecantikan': 'bg-rose-50 text-rose-600',
  'rumah-tangga': 'bg-amber-50 text-amber-600',
  'makanan-minuman': 'bg-orange-50 text-orange-600',
  'olahraga-outdoor': 'bg-green-50 text-green-600',
  'hobi-koleksi': 'bg-purple-50 text-purple-600',
  'otomotif': 'bg-slate-50 text-slate-600',
  'buku-alat-tulis': 'bg-teal-50 text-teal-600',
};

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('position', { ascending: true })
          .limit(12);

        if (!error && data) {
          setCategories(data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fallback categories if database is empty
  const fallbackCategories = [
    { name: 'Elektronik', slug: 'elektronik', icon: 'Smartphone' },
    { name: 'Fashion Pria', slug: 'fashion-pria', icon: 'Shirt' },
    { name: 'Fashion Wanita', slug: 'fashion-wanita', icon: 'ShoppingBag' },
    { name: 'Kesehatan', slug: 'kesehatan-kecantikan', icon: 'Heart' },
    { name: 'Rumah Tangga', slug: 'rumah-tangga', icon: 'Home' },
    { name: 'Makanan', slug: 'makanan-minuman', icon: 'Coffee' },
    { name: 'Olahraga', slug: 'olahraga-outdoor', icon: 'Dumbbell' },
    { name: 'Hobi', slug: 'hobi-koleksi', icon: 'Gamepad2' },
    { name: 'Otomotif', slug: 'otomotif', icon: 'Car' },
    { name: 'Buku', slug: 'buku-alat-tulis', icon: 'BookOpen' },
    { name: 'Promo', slug: 'promo', icon: 'Sparkles' },
    { name: 'Semua', slug: 'all', icon: 'Tag' },
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
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="w-16 h-3 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {displayCategories.map((category) => {
              const IconComponent = iconMap[category.icon] || Tag;
              const colorClass = colorMap[category.slug] || 'bg-gray-50 text-gray-600';

              return (
                <Link
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface transition-all group cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-xs text-center text-primary font-medium leading-tight">
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
