'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DEALS } from '@/constants';
import { ArrowRight, Heart, Star, Eye } from 'lucide-react';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';

const DealsSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <FadeIn delay={0.1}>
          <div className="flex items-center gap-2 mb-8">
             <div className="w-8 h-1 bg-secondary rounded"></div>
             <span className="text-secondary font-medium uppercase tracking-wide">Pilihan Harian</span>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4">Penawaran Hari Ini</h2>
          <p className="text-gray-500 max-w-2xl mb-12">Pilihan kurasi dengan harga terbaik. Perluas koleksi perpustakaan Anda hari ini.</p>
        </FadeIn>

        {/* Large Deal Cards */}
        <StaggerContainer staggerDelay={0.15}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
             {DEALS.map(deal => (
                <motion.div key={deal.id} variants={staggerItem} className="border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg transition-shadow bg-surface">
                 <div className="relative w-full md:w-1/2 bg-white rounded-xl p-4 flex items-center justify-center group">
                    <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">{deal.discount}% off</span>
                    <img src={deal.image} alt={deal.title} className="max-w-full h-48 object-cover rounded shadow-md" />
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-1.5 bg-white rounded-full shadow hover:text-secondary"><Heart size={14} /></button>
                       <button className="p-1.5 bg-white rounded-full shadow hover:text-secondary"><Eye size={14} /></button>
                    </div>
                 </div>
                 <div className="w-full md:w-1/2 flex flex-col justify-center">
                    <span className="text-sm text-gray-500 mb-1">{deal.category}</span>
                    <h3 className="text-xl font-bold text-primary mb-2">{deal.title}</h3>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-xl font-bold text-primary">Rp {deal.price.toLocaleString('id-ID')}</span>
                       <span className="text-sm text-gray-400 line-through">Rp {deal.originalPrice.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-4">
                        <Star size={14} fill="#F5BE30" className="text-secondary" />
                        <span className="font-bold text-primary ml-1">{deal.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-6 leading-relaxed">Item edisi terbatas dengan sampul eksklusif dan catatan penulis.</p>
                    <button className="flex items-center gap-2 text-primary font-bold text-sm hover:text-secondary transition-colors">
                       Tambah ke Keranjang <ArrowRight size={16} />
                    </button>
                 </div>
              </motion.div>
           ))}
          </div>
        </StaggerContainer>

        {/* Banners */}
        <StaggerContainer staggerDelay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           
           {/* Banner 1 */}
           <motion.div variants={staggerItem} className="bg-[#F5F5F5] rounded-3xl p-8 flex items-center justify-between relative overflow-hidden group">
              <div className="relative z-10 w-1/2">
                 <p className="text-gray-500 mb-2">Diskon 20%</p>
                 <h3 className="text-2xl font-bold text-primary mb-2">Novel Grafis</h3>
                 <p className="text-xs text-gray-500 mb-6">Jelajahi visual yang memukau dan cerita yang menarik.</p>
                 <button className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-secondary transition-colors">
                    Belanja Sekarang <ArrowRight size={14} />
                 </button>
              </div>
              <img src="https://images.unsplash.com/photo-1614726365723-49cfae96e70b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="absolute right-0 bottom-0 h-full w-1/2 object-cover translate-y-4 group-hover:translate-y-0 transition-transform opacity-90 rounded-tl-3xl" alt="Comics" />
           </motion.div>

           {/* Banner 2 */}
           <motion.div variants={staggerItem} className="bg-secondary rounded-3xl p-8 flex items-center justify-between relative overflow-hidden group">
              <div className="relative z-10 w-1/2">
                 <p className="text-primary/80 mb-2">Diskon 15%</p>
                 <h3 className="text-2xl font-bold text-primary mb-2">Sastra Klasik</h3>
                 <p className="text-xs text-primary/70 mb-6">Kisah abadi yang membentuk dunia.</p>
                 <button className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-primary transition-colors">
                    Belanja Sekarang <ArrowRight size={14} />
                 </button>
              </div>
              <img src="https://images.unsplash.com/photo-1474932430478-367dbb6832c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" className="absolute right-0 bottom-0 h-full w-1/2 object-cover translate-y-4 group-hover:translate-y-0 transition-transform opacity-90 rounded-tl-3xl" alt="Classics" />
           </motion.div>

          </div>
        </StaggerContainer>
      </div>
    </section>
  );
};

export default DealsSection;