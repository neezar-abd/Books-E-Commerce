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
                  <h3 className="font-bold text-lg text-primary">Free Shipping</h3>
                  <p className="text-sm text-gray-500">Free shipping for order above $180</p>
               </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-soft transition-shadow">
               <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <CreditCard size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-primary">Flexible Payment</h3>
                  <p className="text-sm text-gray-500">Multiple secure payment options</p>
               </div>
            </motion.div>
            <motion.div variants={staggerItem} className="flex items-center gap-4 p-4 rounded-xl hover:shadow-soft transition-shadow">
               <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <HeadphonesIcon size={28} />
               </div>
               <div>
                  <h3 className="font-bold text-lg text-primary">24x7 Support</h3>
                  <p className="text-sm text-gray-500">We support online all days.</p>
               </div>
            </motion.div>
         </div>
         </StaggerContainer>
       </div>
    </section>
  );
};

export default Features;