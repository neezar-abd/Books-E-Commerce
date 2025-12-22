'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Categories: React.FC = () => {
  return (
    <section className="py-16 bg-surface">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
          
          {/* Large Card - Fiction */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 bg-white p-8 rounded-3xl relative overflow-hidden group hover:shadow-card transition-all h-full"
          >
             <div className="relative z-10">
                <span className="text-secondary font-medium mb-1 block">1500+ Judul</span>
                <h2 className="text-4xl font-bold text-primary mb-4">Fiksi</h2>
                <div className="space-y-1 text-gray-500 text-sm">
                   <p>Temukan dunia melampaui imajinasi,</p>
                   <p>dari klasik hingga kontemporer.</p>
                </div>
                
                <div className="mt-8 space-y-2 text-sm text-gray-600">
                   <p className="cursor-pointer hover:text-secondary">Fiksi Sastra</p>
                   <p className="cursor-pointer hover:text-secondary">Sci-Fi & Fantasi</p>
                   <p className="cursor-pointer hover:text-secondary">Misteri & Thriller</p>
                   <p className="cursor-pointer hover:text-secondary">Romansa</p>
                </div>
             </div>
             <img 
               src="https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
               alt="Fiction" 
               className="absolute bottom-0 right-[-50px] w-2/3 h-auto object-contain transition-transform duration-500 group-hover:scale-110 group-hover:-translate-x-4 opacity-80"
             />
          </motion.div>

          {/* Right Column */}
          <div className="lg:col-span-7 grid grid-rows-2 gap-6">
             
             {/* Non-Fiction */}
             <motion.div
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: '-50px' }}
               transition={{ duration: 0.5, delay: 0.2 }}
               className="bg-white p-8 rounded-3xl relative overflow-hidden group hover:shadow-card transition-all flex items-center justify-between h-full"
             >
                <div className="relative z-10 max-w-[45%]">
                   <span className="text-secondary font-medium mb-1 block">750+ Judul</span>
                   <h2 className="text-3xl font-bold text-primary mb-4">Non-Fiksi</h2>
                   <div className="space-y-2 text-sm text-gray-600">
                      <p className="cursor-pointer hover:text-secondary">Biografi</p>
                      <p className="cursor-pointer hover:text-secondary">Sejarah</p>
                      <p className="cursor-pointer hover:text-secondary">Pengembangan Diri</p>
                   </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Non-Fiction" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-40 object-cover rounded-xl shadow-md transition-transform duration-500 group-hover:scale-105"
                />
             </motion.div>

             {/* Art & Design */}
             <motion.div
               initial={{ opacity: 0, x: 50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true, margin: '-50px' }}
               transition={{ duration: 0.5, delay: 0.3 }}
               className="bg-white p-8 rounded-3xl relative overflow-hidden group hover:shadow-card transition-all flex items-center justify-between h-full"
             >
                <div className="relative z-10 max-w-[45%]">
                   <span className="text-secondary font-medium mb-1 block">450+ Judul</span>
                   <h2 className="text-3xl font-bold text-primary mb-4">Seni & Desain</h2>
                   <div className="space-y-2 text-sm text-gray-600">
                      <p className="cursor-pointer hover:text-secondary">Fotografi</p>
                      <p className="cursor-pointer hover:text-secondary">Arsitektur</p>
                      <p className="cursor-pointer hover:text-secondary">Desain Grafis</p>
                   </div>
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" 
                  alt="Art Books" 
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-40 object-cover rounded-xl shadow-md transition-transform duration-500 group-hover:scale-105"
                />
             </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;