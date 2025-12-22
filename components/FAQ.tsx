'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { FadeIn, StaggerContainer, staggerItem } from './AnimationWrappers';

const FAQ: React.FC = () => {
  const [open, setOpen] = useState<number | null>(1);
  const questions = [
     "What types of furniture do you offer?",
     "What payment methods do you accept?",
     "Can I track my furniture delivery?",
     "What is your return policy?",
     "What materials are used in your furniture?",
     "Are there any discounts or promotions available?"
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
         <FadeIn delay={0.1}>
           <div className="text-center mb-12">
              <div className="w-12 h-1 bg-secondary mx-auto mb-4 rounded-full"></div>
              <span className="text-secondary font-medium uppercase tracking-wide">Faqs</span>
              <h2 className="text-3xl font-bold text-primary mt-2">Question? <span className="text-primary">Look here.</span></h2>
           </div>
         </FadeIn>

         <StaggerContainer staggerDelay={0.1}>
           <div className="space-y-4">
            {questions.map((q, i) => (
               <motion.div key={i} variants={staggerItem} className={`border rounded-xl transition-all ${open === i ? 'bg-primary text-white border-primary' : 'bg-white text-primary border-gray-100'}`}>
                  <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-6 font-bold text-left">
                     {q}
                     {open === i ? <Minus size={20} className="text-secondary" /> : <Plus size={20} />}
                  </button>
                  <AnimatePresence>
                    {open === i && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         transition={{ duration: 0.3 }}
                         className="overflow-hidden"
                       >
                         <div className="px-6 pb-6 text-sm text-gray-300">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                         </div>
                       </motion.div>
                    )}
                  </AnimatePresence>
               </motion.div>
            ))}
         </div>
         </StaggerContainer>
      </div>
    </section>
  );
};

export default FAQ;