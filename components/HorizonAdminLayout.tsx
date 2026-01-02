'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import HorizonSidebar from '@/components/horizon/sidebar';
import HorizonNavbar from '@/components/horizon/navbar';
import routes from '@/lib/admin-routes';

export default function HorizonAdminLayout({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Get current page name from routes
    const getCurrentPageName = () => {
        const currentRoute = routes.find(r => pathname === `${r.layout}/${r.path}`);
        return currentRoute?.name || 'Dashboard';
    };

    return (
        <div className="flex h-screen w-full bg-background-100 dark:bg-background-900">
            {/* Sidebar */}
            <HorizonSidebar routes={routes} open={open} setOpen={setOpen} />

            {/* Main Content */}
            <div className="h-full w-full font-dm dark:bg-navy-900 xl:ml-[290px]">
                <main className="mx-2.5 flex-none transition-all dark:bg-navy-900 md:pr-2">
                    {/* Navbar */}
                    <HorizonNavbar
                        onOpenSidenav={() => setOpen(!open)}
                        brandText={getCurrentPageName()}
                    />

                    {/* Page Content */}
                    <div className="mx-auto min-h-screen p-2 !pt-[10px] md:p-2">
                        {children}
                    </div>

                    {/* Footer */}
                    <div className="p-3">
                        <p className="text-center text-sm text-gray-500">
                            © 2026 Zaree Admin. All rights reserved.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
