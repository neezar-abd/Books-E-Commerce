'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck, CreditCard, HeadphonesIcon } from 'lucide-react';
import { StaggerContainer, staggerItem } from './AnimationWrappers';

const Features: React.FC = () => {
  return (
    <section className="py-12 bg-white">
       <div className="container mx-auto px-4">
         <StaggerContainer staggerDelay={0.1}>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-soft transition-shadow">
               <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Truck size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-primary">Gratis Ongkir</h3>
                  <p className="text-sm text-gray-500">Gratis ongkir untuk pembelian di atas Rp 500.000</p>
               </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-soft transition-shadow">
               <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <CreditCard size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-primary">Pembayaran Fleksibel</h3>
                  <p className="text-sm text-gray-500">Berbagai opsi pembayaran yang aman</p>
               </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-soft transition-shadow">
               <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <HeadphonesIcon size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-primary">Dukungan 24x7</h3>
                  <p className="text-sm text-gray-500">Kami siap membantu Anda kapan saja.</p>
               </div>
            </motion.div>
         </div>
         </StaggerContainer>
       </div>
    </section>
  );
};

export default Features;