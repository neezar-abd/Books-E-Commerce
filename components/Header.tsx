'use client';

import React, { useState, useEffect } from 'react';
import { Search, Heart, ShoppingCart, User, Menu, X, BookOpen, Phone, Instagram, Facebook, Twitter, Youtube, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { cartService } from '@/lib/cart';

const Header: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Get initial user
    checkUser();

    // Get cart count
    loadCartCount();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadCartCount();
      } else {
        setCartCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadCartCount = async () => {
    try {
      const count = await cartService.getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error loading cart count:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setShowUserMenu(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-primary text-white text-xs py-2 px-4 md:px-8">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
           <div className="flex items-center gap-6">
              <Link href="/contact" className="flex items-center gap-2 hover:text-secondary"><Phone size={12} /> Support: +62123-456-789</Link>
              <span className="hidden md:inline">Bergabung dengan Readers Club untuk diskon 20%. <Link href="/signup" className="underline text-secondary font-bold">Daftar Sekarang</Link></span>
           </div>
           <div className="flex items-center gap-4">
              <a href="#" className="hover:text-secondary"><Facebook size={12} /></a>
              <a href="#" className="hover:text-secondary"><Twitter size={12} /></a>
              <a href="#" className="hover:text-secondary"><Instagram size={12} /></a>
              <a href="#" className="hover:text-secondary"><Youtube size={12} /></a>
              <span className="ml-4 flex items-center gap-1 cursor-pointer">IDR <span className="text-[8px]">▼</span></span>
           </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-white py-4 md:py-6 border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-secondary rounded-full p-1.5">
               <BookOpen size={20} className="text-white" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-primary tracking-tight">Uchinaga<span className="text-secondary">Books</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-primary">
            {[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Categories', href: '/#categories' },
              { label: 'Bestsellers', href: '/#flash-sale' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                className="hover:text-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5 text-primary">
            <button><Search size={20} /></button>
            <button><Heart size={20} /></button>
            <Link href="/cart" className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 hover:text-secondary transition-colors"
                >
                  <User size={20} />
                  <span className="hidden md:inline text-sm font-medium">
                    {user.user_metadata?.full_name?.split(' ')[0] || 'Akun'}
                  </span>
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-50">
                    <Link 
                      href="/my-account" 
                      className="block px-4 py-2 text-sm hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Akun Saya
                    </Link>
                    <Link 
                      href="/my-account?tab=orders" 
                      className="block px-4 py-2 text-sm hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Pesanan Saya
                    </Link>
                    <Link 
                      href="/my-account?tab=addresses" 
                      className="block px-4 py-2 text-sm hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Alamat
                    </Link>
                    <Link 
                      href="/track-order" 
                      className="block px-4 py-2 text-sm hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Lacak Pesanan
                    </Link>
                    <hr className="my-2 border-gray-100" />
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/sign-in"
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-full hover:bg-opacity-90 transition-all text-sm font-medium"
              >
                <User size={16} />
                <span className="hidden md:inline">Masuk</span>
              </Link>
            )}
            
            {/* Mobile Toggle */}
            <button className="lg:hidden ml-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-4 flex flex-col gap-4 animate-fade-in z-40">
            {[
              { label: 'Home', href: '/' },
              { label: 'Products', href: '/products' },
              { label: 'Categories', href: '/#categories' },
              { label: 'Bestsellers', href: '/#flash-sale' },
              { label: 'Contact', href: '/contact' },
            ].map((link) => (
              <Link 
                key={link.label}
                href={link.href}
                className="text-base font-medium text-primary hover:text-secondary py-2 border-b border-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;