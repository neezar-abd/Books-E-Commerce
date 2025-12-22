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
              {[1,2,3,4,5].map(i => (
                 <motion.div key={i} variants={staggerItem} className="relative group overflow-hidden rounded-2xl aspect-square">
                  <img src={`https://images.unsplash.com/photo-1555041469-a586c61ea9bc?random=${i}&w=400&q=80`} className="w-full h-full object-cover" alt="Instagram" />
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