'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TESTIMONIALS } from '@/constants';
import { Quote, Star } from 'lucide-react';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-surface">
      <div className="container mx-auto px-4">
        
        <FadeIn delay={0.1}>
          <div className="text-center mb-12">
             <div className="w-12 h-1 bg-secondary mx-auto mb-4 rounded-full"></div>
             <span className="text-secondary font-medium uppercase tracking-wide">Testimoni</span>
             <h2 className="text-3xl font-bold text-primary mt-2">Kata Pelanggan Kami</h2>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             {TESTIMONIALS.map(t => (
               <motion.div key={t.id} variants={staggerItem} className="bg-white p-8 rounded-3xl relative hover:shadow-soft transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                   <div className="relative">
                      <img src={t.avatar} alt={t.name} className="w-16 h-16 rounded-full object-cover border-4 border-surface" />
                      <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-1 text-white">
                         <Quote size={12} fill="currentColor" />
                      </div>
                   </div>
                   <div>
                      <h4 className="font-bold text-primary text-lg">{t.name}</h4>
                      <p className="text-gray-400 text-sm">{t.role}</p>
                      <div className="flex items-center gap-1 mt-1">
                         {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#F5BE30" className="text-secondary" />)}
                         <span className="ml-1 text-sm font-bold text-primary">{t.rating}</span>
                      </div>
                   </div>
                   <div className="ml-auto text-primary opacity-10">
                      <Quote size={48} fill="currentColor" />
                   </div>
                </div>
                <p className="text-gray-500 leading-relaxed text-sm">"{t.quote}"</p>
             </motion.div>
           ))}
        </div>
        </StaggerContainer>

        <FadeIn delay={0.3}>
          <div className="flex justify-center gap-2 mt-8">
           <div className="w-8 h-1.5 bg-primary rounded-full"></div>
           <div className="w-4 h-1.5 bg-gray-300 rounded-full"></div>
           <div className="w-4 h-1.5 bg-gray-300 rounded-full"></div>
          </div>
        </FadeIn>

      </div>
    </section>
  );
};

export default Testimonials;