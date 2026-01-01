'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const VerifyCode: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '', '', '']); // 8 digits
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resending, setResending] = useState(false);

  const testimonials = [
    {
      quote: "Verifikasi dua faktor membuat saya merasa lebih aman. Sangat appreciate dengan komitmen Zaree terhadap keamanan pelanggan!",
      name: "Ronald Richards",
      role: "Pemilik Bisnis",
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      quote: "Proses verifikasi yang smooth dan cepat. Tidak perlu menunggu lama untuk mendapatkan kode verifikasi.",
      name: "Lisa Anderson",
      role: "Blogger",
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      quote: "Sistem keamanan yang modern dan user-friendly. Zaree benar-benar memperhatikan detail dalam setiap aspek!",
      name: "David Kim",
      role: "Product Manager",
      image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    // Auto-focus next input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 8);
    const newCodes = pastedData.split('').concat(Array(8).fill('')).slice(0, 8);
    setCodes(newCodes);

    // Focus last filled input or next empty
    const lastFilledIndex = Math.min(pastedData.length, 7);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null): void => {
    inputRefs.current[index] = el;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    const otp = codes.join('');
    if (otp.length !== 8) {
      setError('Masukkan kode 8 digit lengkap');
      return;
    }

    if (!email) {
      setError('Email tidak ditemukan. Silakan daftar ulang.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Verify OTP with Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (verifyError) throw verifyError;

      // Success! Redirect to home
      router.push('/');

    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Kode verifikasi salah atau sudah kedaluwarsa');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Email tidak ditemukan');
      return;
    }

    setResending(true);
    setError('');

    try {
      // Resend OTP
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (resendError) throw resendError;

      alert('Kode verifikasi baru telah dikirim ke email Anda!');

    } catch (err: any) {
      console.error('Resend error:', err);
      setError('Gagal mengirim ulang kode');
    } finally {
      setResending(false);
    }
  };

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
            <span className="text-2xl font-bold text-primary tracking-tight">Zaree</span>
          </Link>

          {/* Title */}
          <h1 className="text-4xl font-bold text-primary mb-2">Verifikasi Kode</h1>
          <p className="text-gray-600 mb-8">
            Silakan masukkan kode 8 digit yang baru saja kami kirim ke email <span className="font-bold text-primary">{email || 'Anda'}</span>
          </p>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl text-sm mb-6">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">

            {/* Code Inputs */}
            <div>
              <label className="block text-sm font-bold text-primary mb-4">
                Kode <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {codes.map((code, index) => (
                  <input
                    key={index}
                    ref={setInputRef(index)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={code}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-10 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-full font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </button>

            {/* Resend Code */}
            <p className="text-center text-sm text-gray-600 mt-6">
              Tidak menerima kode? {' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="font-bold text-primary underline hover:text-secondary disabled:opacity-50"
              >
                {resending ? 'Mengirim...' : 'Kirim Ulang Kode'}
              </button>
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
                  className={`h-2 rounded-full transition-all ${index === currentTestimonial ? 'w-12 bg-secondary' : 'w-2 bg-white/50'
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

export default VerifyCode;
