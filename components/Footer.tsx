import React from 'react';
import { BookOpen, Facebook, Twitter, Instagram, Youtube, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white pt-16 pb-6">
      <div className="container mx-auto px-4">
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <div className="bg-secondary rounded-full p-1.5 text-primary">
                     <BookOpen size={20} fill="currentColor" />
                  </div>
                  <span className="text-2xl font-bold">Lumina<span className="text-secondary">.</span></span>
               </div>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                  Toko buku online terpercaya dengan koleksi lengkap dan berkualitas. Temukan bacaan favorit Anda dengan harga terbaik dan pengiriman cepat.
               </p>
               <div className="flex gap-4">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                     <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
                        <Icon size={14} />
                     </a>
                  ))}
               </div>
            </div>

            {/* Links */}
            <div>
               <h4 className="font-bold mb-6">Perusahaan</h4>
               <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="/#features" className="hover:text-secondary">Tentang Kami</a></li>
                  <li><a href="/#blog" className="hover:text-secondary">Blog</a></li>
                  <li><a href="/contact" className="hover:text-secondary">Hubungi Kami</a></li>
                  <li><a href="/#" className="hover:text-secondary">Karir</a></li>
               </ul>
            </div>

            <div>
               <h4 className="font-bold mb-6">Layanan Pelanggan</h4>
               <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="/my-account" className="hover:text-secondary">Akun Saya</a></li>
                  <li><a href="/track-order" className="hover:text-secondary">Lacak Pesanan</a></li>
                  <li><a href="/#" className="hover:text-secondary">Pengembalian</a></li>
                  <li><a href="/#faq" className="hover:text-secondary">FAQ</a></li>
               </ul>
            </div>

            {/* Contact */}
            <div>
               <h4 className="font-bold mb-6">Kontak Kami</h4>
               <ul className="space-y-4 text-sm text-gray-400">
                  <li><span className="block text-white mb-1">+62123-456-789</span></li>
                  <li><span className="block text-white mb-1">hello@lumina.com</span></li>
                  <li><span className="block leading-relaxed">Jl. Sudirman No. 789, Menteng, Jakarta Pusat, DKI Jakarta 10310</span></li>
               </ul>
            </div>
         </div>

         {/* Bottom Bar */}
         <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-secondary">
            <p>Copyright © 2024 Lumina. All Rights Reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
               <span>Indonesia ▼</span>
               <span>|</span>
               <span>IDR ▼</span>
            </div>
         </div>
      </div>
    </footer>
  );
};

export default Footer;