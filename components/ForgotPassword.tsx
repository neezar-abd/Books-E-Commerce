'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const ForgotPassword: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      quote: "Proses reset password sangat mudah dan cepat. Dalam hitungan menit, saya sudah bisa kembali berbelanja buku favorit!",
      name: "Ronald Richards",
      role: "Pemilik Bisnis",
      image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      quote: "Keamanan akun sangat terjaga dengan sistem verifikasi yang ketat. Saya merasa aman berbelanja di Lumina.",
      name: "Sarah Johnson",
      role: "Digital Marketer",
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      quote: "Customer support sangat responsif membantu saya ketika mengalami masalah login. Pelayanan luar biasa!",
      name: "Michael Chen",
      role: "Software Engineer",
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
          <h1 className="text-4xl font-bold text-primary mb-2">Lupa Password?</h1>
          <p className="text-gray-600 mb-8">Jangan khawatir, kami akan mengirimkan instruksi reset password kepada Anda.</p>

          {/* Form */}
          <form className="space-y-6">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Masukkan Email Di Sini"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-opacity-90 transition-all"
            >
              Kirim
            </button>

            {/* Back to Sign In */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Ingat Password? <Link href="/signin" className="font-bold text-primary underline hover:text-secondary">Masuk</Link>
            </p>
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

export default ForgotPassword;
