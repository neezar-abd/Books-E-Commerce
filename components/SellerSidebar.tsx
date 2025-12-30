'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Store,
    Star,
    Wallet,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/seller/dashboard' },
    { icon: Store, label: 'Toko Saya', href: '/seller/store' },
    { icon: Package, label: 'Produk', href: '/seller/products' },
    { icon: ShoppingBag, label: 'Pesanan', href: '/seller/orders' },
];

export default function SellerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await authService.signOut();
            router.push('/sign-in');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed top-0 left-0 h-screen w-64 bg-primary text-white z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-white/10">
                        <Link href="/seller/dashboard" className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                                <Store size={20} className="text-primary" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold">Seller Center</h1>
                                <p className="text-xs text-white/60">Zaree Seller Center</p>
                            </div>
                        </Link>
                    </div>

                    {/* Back to Store */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-6 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                        <ChevronLeft size={16} />
                        Kembali ke Toko
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="relative"
                                >
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-colors duration-200
                      ${isActive
                                                ? 'bg-secondary text-primary font-semibold'
                                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                                            }
                    `}
                                    >
                                        <Icon size={20} />
                                        <span>{item.label}</span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-white/10">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-red-500/20 hover:text-red-300 rounded-xl transition-colors duration-200"
                        >
                            <LogOut size={20} />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
