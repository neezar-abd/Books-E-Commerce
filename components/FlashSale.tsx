'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SlideIn, ScaleIn } from './AnimationWrappers';

const FlashSale: React.FC = () => {
   const [time, setTime] = useState({ days: 4, hours: 14, minutes: 48, seconds: 18 });

   useEffect(() => {
      const interval = setInterval(() => {
         setTime(prev => {
            let { days, hours, minutes, seconds } = prev;
            seconds--;
            if (seconds < 0) { seconds = 59; minutes--; }
            if (minutes < 0) { minutes = 59; hours--; }
            if (hours < 0) { hours = 23; days--; }
            return { days, hours, minutes, seconds };
         });
      }, 1000);
      return () => clearInterval(interval);
   }, []);

   return (
      <section className="py-20 bg-surface">
         <div className="container-80">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

               {/* Left Block - Timer */}
               <SlideIn direction="left" delay={0.1}>
                  <div className="bg-[#F5F5F5] rounded-3xl p-12 flex flex-col justify-center relative overflow-hidden h-full">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>

                     <h2 className="text-4xl font-bold text-primary mb-2">Pameran <span className="text-secondary">Buku!</span></h2>
                     <p className="text-gray-500 mb-8">Diskon 25% semua Hardcover - Penawaran Terbatas!</p>

                     <div className="flex items-center gap-4 mb-8">
                        {[
                           { label: 'Hari', val: time.days },
                           { label: 'Jam', val: time.hours },
                           { label: 'Menit', val: time.minutes },
                           { label: 'Detik', val: time.seconds },
                        ].map((t, i) => (
                           <div key={i} className="flex items-center">
                              <div className="text-center">
                                 <div className="text-3xl font-bold text-primary mb-1">{t.val.toString().padStart(2, '0')}</div>
                                 <div className="text-xs text-gray-400 uppercase tracking-wide">{t.label}</div>
                              </div>
                              {i < 3 && <div className="text-2xl text-primary font-bold mx-4 -mt-4">:</div>}
                           </div>
                        ))}
                     </div>

                     <button className="bg-primary text-white px-8 py-3 rounded-full font-bold self-start flex items-center gap-2 hover:bg-secondary hover:text-primary transition-all">
                        Belanja Buku <ArrowRight size={16} />
                     </button>
                  </div>
               </SlideIn>

               {/* Right Block - Images */}
               <SlideIn direction="right" delay={0.2}>
                  <div className="grid grid-cols-2 gap-4 h-[400px]">
                     <img
                        src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        className="w-full h-full object-cover rounded-3xl"
                        alt="Book Stack"
                     />
                     <img
                        src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
                        className="w-full h-full object-cover rounded-3xl mt-8"
                        alt="Reading"
                     />
                  </div>
               </SlideIn>

            </div>
         </div>
      </section>
   );
};

export default FlashSale;
