'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Menu, X, BookOpen, Bell, HelpCircle, Globe, ChevronDown, LogOut, Heart, Store, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { authService } from '@/lib/auth';
import { cartService } from '@/lib/cart';

const Header: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [cartCount, setCartCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    checkUser();
    loadCartCount();

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
    if (user) {
      // Fetch user profile to get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) setUserRole(profile.role || 'user');
    }
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="w-full relative z-50">
      {/* Top Bar - Like Shopee */}
      <div className="bg-primary text-white text-xs py-2 px-4 z-50">
        <div className="container-80 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {user ? (
              userRole === 'seller' ? (
                <Link href="/seller/dashboard" className="flex items-center gap-1 hover:text-secondary transition-colors">
                  <Store size={12} />
                  <span className="hidden sm:inline">Seller Centre</span>
                </Link>
              ) : userRole === 'user' ? (
                <Link href="/seller/register" className="flex items-center gap-1 hover:text-secondary transition-colors">
                  <Store size={12} />
                  <span className="hidden sm:inline">Jadi Seller</span>
                </Link>
              ) : null
            ) : (
              <Link href="/seller/register" className="flex items-center gap-1 hover:text-secondary transition-colors">
                <Store size={12} />
                <span className="hidden sm:inline">Jadi Seller</span>
              </Link>
            )}
            <span className="text-white/30">|</span>
            <a href="#" className="flex items-center gap-1 hover:text-secondary transition-colors">
              <Download size={12} />
              <span className="hidden sm:inline">Download App</span>
            </a>
            <span className="hidden md:inline text-white/60">Ikuti kami di</span>
            <div className="hidden md:flex items-center gap-2">
              <a href="#" className="hover:text-secondary"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
              <a href="#" className="hover:text-secondary"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" /></svg></a>
              <a href="#" className="hover:text-secondary"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg></a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-1 hover:text-secondary transition-colors">
              <Bell size={12} />
              <span className="hidden sm:inline">Notifikasi</span>
            </a>
            <a href="/contact" className="flex items-center gap-1 hover:text-secondary transition-colors">
              <HelpCircle size={12} />
              <span className="hidden sm:inline">Bantuan</span>
            </a>
            <button className="flex items-center gap-1 hover:text-secondary transition-colors">
              <Globe size={12} />
              <span className="hidden sm:inline">Bahasa Indonesia</span>
              <ChevronDown size={10} />
            </button>

            {/* User Account */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1 hover:text-secondary transition-colors"
                >
                  <User size={12} />
                  <span className="hidden sm:inline">{user.user_metadata?.full_name?.split(' ')[0] || 'Akun'}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-lg rounded-xl border border-gray-100 py-2 z-[200] text-primary text-sm">
                    <Link
                      href="/my-account"
                      className="block px-4 py-2 hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Akun Saya
                    </Link>
                    <Link
                      href="/my-account?tab=orders"
                      className="block px-4 py-2 hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Pesanan Saya
                    </Link>
                    <Link
                      href="/track-order"
                      className="block px-4 py-2 hover:bg-surface transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Lacak Pesanan
                    </Link>
                    {userRole === 'seller' && (
                      <>
                        <hr className="my-2 border-gray-100" />
                        <Link
                          href="/seller/dashboard"
                          className="block px-4 py-2 hover:bg-surface transition-colors flex items-center gap-2 text-blue-600 font-medium"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Store size={14} />
                          Seller Center
                        </Link>
                      </>
                    )}
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/signup" className="hover:text-secondary">Daftar</Link>
                <span className="text-white/30">|</span>
                <Link href="/sign-in" className="hover:text-secondary">Masuk</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-primary py-4 sticky top-0 z-[100]">
        <div className="container-80 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="bg-secondary rounded-full p-1.5">
              <BookOpen size={24} className="text-primary" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight hidden md:inline">
              Zaree
            </span>
          </Link>

          {/* Search Bar - Prominent */}
          <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
            <div className="relative flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk di Zaree..."
                className="w-full py-2.5 px-4 rounded-l-lg bg-white text-primary placeholder-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-secondary hover:bg-secondary/90 text-primary px-6 rounded-r-lg flex items-center justify-center transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Cart */}
          <Link href="/cart" className="relative text-white hover:text-secondary transition-colors flex-shrink-0">
            <ShoppingCart size={28} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-primary">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Search suggestions (if needed) */}
        <div className="container-80 mt-2 hidden lg:block">
          <div className="flex items-center gap-3 text-white/80 text-xs overflow-x-auto no-scrollbar">
            {['Elektronik', 'Fashion Pria', 'Fashion Wanita', 'Kesehatan', 'Rumah Tangga', 'Makanan'].map((tag) => (
              <Link
                key={tag}
                href={`/products?search=${encodeURIComponent(tag)}`}
                className="hover:text-secondary transition-colors whitespace-nowrap"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Row */}
      <div className="bg-white border-b border-gray-100 hidden lg:block">
        <div className="container-80">
          <nav className="flex items-center gap-8 py-3 text-sm font-medium text-primary">
            {[
              { label: 'Beranda', href: '/' },
              { label: 'Semua Produk', href: '/products' },
              { label: 'Kategori', href: '/#categories' },
              { label: 'Flash Sale', href: '/#flash-sale' },
              { label: 'Bestseller', href: '/#bestsellers' },
              { label: 'Promo', href: '/#promo' },
              { label: 'Kontak', href: '/contact' },
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
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[120px] bg-white z-40 overflow-y-auto">
          <div className="p-4 space-y-2">
            {[
              { label: 'Beranda', href: '/' },
              { label: 'Semua Produk', href: '/products' },
              { label: 'Kategori', href: '/#categories' },
              { label: 'Flash Sale', href: '/#flash-sale' },
              { label: 'Bestseller', href: '/#bestsellers' },
              { label: 'Kontak', href: '/contact' },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="block py-3 px-4 text-primary font-medium hover:bg-surface rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
