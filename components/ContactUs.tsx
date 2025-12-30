'use client';

import React from 'react';
import { Truck, CreditCard, Headphones, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

const ContactUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Beranda</Link>
          <span className="mx-2">/</span>
          <span className="text-primary font-medium">Hubungi Kami</span>
        </div>

        {/* Page Title */}
        <h1 className="text-4xl font-bold text-primary mb-12 text-center">Hubungi Kami</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">Hubungi Kami</h2>
            <p className="text-gray-600 mb-6">Alamat email Anda tidak akan dipublikasikan. Kolom yang wajib diisi ditandai dengan *</p>

            <form className="space-y-5">
              {/* Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Nama Anda <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  Subjek <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Subjek"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  Pesan Anda <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Tulis pesan di sini..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-primary text-white px-12 py-4 rounded-full font-bold hover:bg-opacity-90 transition-all"
              >
                Kirim Pesan
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="bg-primary text-white rounded-3xl p-8">
            <div className="space-y-8">

              {/* Address */}
              <div>
                <h3 className="text-2xl font-bold mb-3">Alamat</h3>
                <p className="text-white/90">
                  Jl. Sudirman No. 789, Menteng<br />
                  Jakarta Pusat, DKI Jakarta 10310
                </p>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-2xl font-bold mb-3">Kontak</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Phone size={18} />
                    <span className="text-white/90">+62123-456-789</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <span className="text-white/90">hello@zaree.id</span>
                  </div>
                </div>
              </div>

              {/* Open Time */}
              <div>
                <h3 className="text-2xl font-bold mb-3">Jam Operasional</h3>
                <div className="space-y-1 text-white/90">
                  <p>Senin - Jumat: 10:00 - 20:00</p>
                  <p>Sabtu - Minggu: 11:00 - 18:00</p>
                </div>
              </div>

              {/* Stay Connected */}
              <div>
                <h3 className="text-2xl font-bold mb-3">Tetap Terhubung</h3>
                <div className="flex gap-3">
                  <a href="#" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                    <Facebook size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                    <Twitter size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                    <Instagram size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                    <Youtube size={20} />
                  </a>
                  <a href="#" className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="w-full h-96 bg-gray-200 rounded-3xl overflow-hidden mb-16">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260322283!2d106.8195613!3d-6.1944491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f5d2e764b12d%3A0x3d2ad6e1e0e9bcc8!2sJakarta%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Truck size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Gratis Ongkir</h3>
              <p className="text-sm text-gray-600">Gratis ongkir untuk pesanan di atas Rp 500.000</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Pembayaran Fleksibel</h3>
              <p className="text-sm text-gray-600">Berbagai opsi pembayaran yang aman</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-surface rounded-2xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Headphones size={28} className="text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-primary mb-1">Layanan 24/7</h3>
              <p className="text-sm text-gray-600">Kami support online setiap hari</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
