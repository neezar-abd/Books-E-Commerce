'use client';

import React from 'react';
import { Mail } from 'lucide-react';
import { FadeIn, ScaleIn } from './AnimationWrappers';

const Newsletter: React.FC = () => {
  return (
    <section className="py-20 bg-surface relative overflow-hidden">
       {/* Background Pattern */}
       <div className="absolute inset-0 pointer-events-none opacity-5">
           <div className="grid grid-cols-12 gap-4">
              {[...Array(100)].map((_, i) => <div key={i} className="w-2 h-2 bg-primary rounded-full"></div>)}
           </div>
       </div>

       <div className="container mx-auto px-4 text-center relative z-10">
          <FadeIn delay={0.1}>
            <div className="w-12 h-1 bg-secondary mx-auto mb-4 rounded-full"></div>
            <span className="text-secondary font-medium uppercase tracking-wide">Our Newsletter</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mt-4 mb-4">Subscribe to Our Newsletter to Get <br/> Updates to Our Latest Collection</h2>
            <p className="text-gray-500 mb-8">Get 20% off on your first order just by subscribing to our newsletter</p>
          </FadeIn>

          <ScaleIn delay={0.3}>
            <div className="max-w-xl mx-auto bg-white p-2 rounded-full shadow-lg flex items-center">
             <div className="pl-4 text-gray-400">
                <Mail size={20} />
             </div>
             <input type="email" placeholder="Enter Email Address" className="flex-1 px-4 py-3 outline-none text-primary" />
             <button className="bg-secondary text-primary font-bold px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-colors">
                Subscribe
             </button>
            </div>
          </ScaleIn>
       </div>
    </section>
  );
};

export default Newsletter;