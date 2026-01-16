'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { HERO_PRODUCTS } from '@/constants';
import { motion } from 'framer-motion';
import { FadeIn, SlideIn } from './AnimationWrappers';

const Hero: React.FC = () => {
  return (
    <section className="bg-surface pt-12 pb-20 relative overflow-hidden">

      {/* Decor Dots */}
      <div className="absolute top-10 left-10 opacity-20">
        <div className="grid grid-cols-6 gap-2">
          {[...Array(24)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-primary rounded-full"></div>)}
        </div>
      </div>

      <div className="container-80">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div className="max-w-xl z-10">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm mb-6">
                <span className="text-xl"></span>
                <span className="text-sm font-semibold text-primary"></span>
              </div>
            </FadeIn>

            <SlideIn direction="up" delay={0.2}>
              <h1 className="text-5xl lg:text-6xl font-bold text-primary leading-[1.15] mb-6" style={{ fontFamily: 'Satoshi, sans-serif', fontWeight: 700, letterSpacing: '-0.01em' }}>
                Temukan <br />
                <span className="text-secondary">Semua Kebutuhan</span> <br />
                Anda di Sini
              </h1>
            </SlideIn>

            <FadeIn delay={0.3}>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Belanja mudah, aman, dan nyaman. Dari elektronik hingga fashion, kami menghadirkan produk terbaik untuk Anda.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex items-center gap-6 mb-10">
                <a href="/#products" className="bg-primary text-white px-8 py-3.5 rounded-full font-medium hover:bg-opacity-90 transition-all flex items-center gap-2 group">
                  Jelajahi Produk <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="/#flash-sale" className="font-semibold text-primary underline decoration-2 underline-offset-4 hover:text-secondary hover:decoration-secondary transition-colors">
                  Lihat Terlaris
                </a>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <img key={i} src={`https://randomuser.me/api/portraits/women/${40 + i}.jpg`} className="w-10 h-10 rounded-full border-2 border-white" alt="User" />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold border-2 border-white">+</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 font-bold text-primary">
                    4.9/5 Rating
                  </div>
                  <div className="text-xs text-gray-500">Dipercaya 200K+ Pelanggan</div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Content - Cards */}
          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-8 no-scrollbar snap-x">
              {HERO_PRODUCTS.map((item, idx) => (
                <div key={item.id} className="min-w-[300px] md:min-w-[400px] relative rounded-3xl overflow-hidden snap-center group cursor-pointer shadow-lg hover:shadow-xl transition-all">
                  <div className="w-full h-[500px] bg-gray-100 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay gradient for text readability if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>

                  <div className="absolute top-4 left-4 bg-white/30 backdrop-blur-md rounded-full p-2 border border-white/50">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary">
                      <BookOpen size={20} />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-2xl flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-lg text-primary">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.count}</p>
                    </div>
                    <button className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-4 lg:absolute lg:-bottom-10 lg:left-0">
              <button className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-opacity-80 transition-all">
                <ArrowLeft size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-secondary text-primary flex items-center justify-center hover:bg-opacity-80 transition-all">
                <ArrowRight size={20} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;