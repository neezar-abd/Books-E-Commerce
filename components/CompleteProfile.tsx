'use client';

import React, { useState } from 'react';
import { BookOpen, Upload, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const CompleteProfile: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "Setelah melengkapi profil, saya mendapat rekomendasi buku yang sangat personal dan sesuai dengan minat saya. Pengalaman berbelanja jadi lebih menyenangkan!",
      name: "Ronald Richards",
      role: "Interior Designer",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      quote: "Proses lengkapi profil sangat mudah dan cepat. Sekarang checkout lebih praktis karena data saya sudah tersimpan dengan aman.",
      name: "Diana Putri",
      role: "Content Creator",
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      quote: "Dengan profil yang lengkap, saya selalu dapat notifikasi promo dan diskon eksklusif. Sangat worth it!",
      name: "Ahmad Santoso",
      role: "Pengusaha",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen flex">
      
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-12">
            <div className="bg-secondary rounded-full p-2">
              <BookOpen size={24} className="text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">Lumina<span className="text-secondary">.</span></span>
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-bold text-primary mb-2">Lengkapi Profil Anda</h1>
          <p className="text-gray-600 mb-8">Jangan khawatir, hanya Anda yang dapat melihat data personal Anda.</p>

          {/* Form */}
          <form className="space-y-6">
            
            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-bold text-primary mb-3">
                Foto Profil (Opsional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center">
                    <Upload size={24} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Seret foto ke sini</p>
                    <button type="button" className="text-primary font-bold underline hover:text-secondary">
                      Pilih File
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Telepon <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Masukkan Nomor Telepon"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors appearance-none">
                  <option value="">Pilih</option>
                  <option value="female">Perempuan</option>
                  <option value="male">Laki-laki</option>
                  <option value="other">Lainnya</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Complete Profile Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Lengkapi Profil
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Testimonial */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={testimonials[currentTestimonial].image}
            alt="Background"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="relative z-10 flex items-end p-12 w-full">
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 w-full">
            <p className="text-white text-lg leading-relaxed mb-6 italic">
              "{testimonials[currentTestimonial].quote}"
            </p>
            <div>
              <h3 className="text-white font-bold text-xl">{testimonials[currentTestimonial].name}</h3>
              <p className="text-white/80">{testimonials[currentTestimonial].role}</p>
            </div>
            
            {/* Dots */}
            <div className="flex gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentTestimonial ? 'w-12 bg-secondary' : 'w-2 bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
