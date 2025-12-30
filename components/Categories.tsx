'use client';

import React from 'react';
import { Book, BookOpen, Baby, Palette, Briefcase, Heart, Lightbulb, Music, Globe, Utensils, Dumbbell, Sparkles } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES = [
  { name: 'Fiksi', icon: BookOpen, color: 'bg-blue-50 text-blue-600', href: '/products?category=fiction' },
  { name: 'Non-Fiksi', icon: Book, color: 'bg-green-50 text-green-600', href: '/products?category=non-fiction' },
  { name: 'Anak-Anak', icon: Baby, color: 'bg-pink-50 text-pink-600', href: '/products?category=children' },
  { name: 'Seni & Desain', icon: Palette, color: 'bg-purple-50 text-purple-600', href: '/products?category=art' },
  { name: 'Bisnis', icon: Briefcase, color: 'bg-amber-50 text-amber-600', href: '/products?category=business' },
  { name: 'Romansa', icon: Heart, color: 'bg-red-50 text-red-600', href: '/products?category=romance' },
  { name: 'Self-Help', icon: Lightbulb, color: 'bg-yellow-50 text-yellow-600', href: '/products?category=self-help' },
  { name: 'Musik', icon: Music, color: 'bg-indigo-50 text-indigo-600', href: '/products?category=music' },
  { name: 'Sejarah', icon: Globe, color: 'bg-teal-50 text-teal-600', href: '/products?category=history' },
  { name: 'Kuliner', icon: Utensils, color: 'bg-orange-50 text-orange-600', href: '/products?category=culinary' },
  { name: 'Kesehatan', icon: Dumbbell, color: 'bg-lime-50 text-lime-600', href: '/products?category=health' },
  { name: 'Semua Promo', icon: Sparkles, color: 'bg-secondary/20 text-secondary', href: '/products?promo=true' },
];

const Categories: React.FC = () => {
  return (
    <section className="py-6 bg-white" id="categories">
      <div className="container-80">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">KATEGORI</h2>
          <Link href="/products" className="text-sm text-secondary hover:underline">
            Lihat Semua
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4">
          {CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <Link
                key={category.name}
                href={category.href}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface transition-all group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <IconComponent size={24} />
                </div>
                <span className="text-xs text-center text-primary font-medium leading-tight">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
