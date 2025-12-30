'use client';

import React from 'react';
import SellerSidebar from '@/components/SellerSidebar';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-surface">
            <SellerSidebar />
            <main className="lg:ml-64 min-h-screen">
                {children}
            </main>
        </div>
    );
}
