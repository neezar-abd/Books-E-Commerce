'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BLOGS } from '@/constants';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';

const BlogSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        
        <FadeIn delay={0.1}>
          <div className="flex items-end justify-between mb-12">
             <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-8 h-1 bg-secondary rounded"></div>
                   <span className="text-secondary font-medium uppercase tracking-wide">Berita & Blog</span>
                </div>
                <h2 className="text-3xl font-bold text-primary">Berita & Blog <br/> Terbaru Kami</h2>
             </div>
             <button className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-secondary hover:text-primary transition-colors">
                Lihat Semua Blog
             </button>
          </div>
        </FadeIn>

        <StaggerContainer staggerDelay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {BLOGS.map(blog => (
                <motion.div key={blog.id} variants={staggerItem} className="group cursor-pointer">
                 <div className="relative overflow-hidden rounded-2xl mb-4 h-64">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute bottom-4 left-4 bg-secondary text-primary text-xs font-bold px-3 py-1.5 rounded">
                       {blog.date}
                    </div>
                 </div>
                 <h3 className="text-xl font-bold text-primary mb-2 leading-tight group-hover:text-secondary transition-colors">{blog.title}</h3>
                 <p className="text-gray-500 text-sm mb-4 line-clamp-2">{blog.description}</p>
                 <a href="#" className="text-primary font-bold underline decoration-2 underline-offset-4 hover:text-secondary">Baca Selengkapnya</a>
              </motion.div>
           ))}
          </div>
        </StaggerContainer>

      </div>
    </section>
  );
};

export default BlogSection;