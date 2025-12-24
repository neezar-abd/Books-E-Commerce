'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';

const InstagramFeed: React.FC = () => {
  return (
    <section className="py-12 bg-surface">
      <div className="container mx-auto px-4 text-center">
         <FadeIn delay={0.1}>
           <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-1 bg-secondary rounded"></div>
              <span className="text-secondary font-medium uppercase tracking-wide">Follow Us</span>
           </div>
           <h2 className="text-3xl font-bold text-primary mb-10">Follow Us On <span className="text-primary">Instagram</span></h2>
         </FadeIn>

         <StaggerContainer staggerDelay={0.1}>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Tumpukan buku
                'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Pembaca mencintai buku
                'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Buku desain
                'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', // Buku terbuka cantik
                'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'  // Pembaca sunyi
              ].map((imgUrl, i) => (
                 <motion.div key={i} variants={staggerItem} className="relative group overflow-hidden rounded-2xl aspect-square">
                  <img src={imgUrl} className="w-full h-full object-cover" alt={`Instagram post ${i + 1}`} loading="lazy" />
                  <div className="absolute inset-0 bg-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Instagram className="text-white" size={32} />
                  </div>
               </motion.div>
            ))}
           </div>
         </StaggerContainer>
      </div>
    </section>
  );
};

export default InstagramFeed;