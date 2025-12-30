import React from 'react';
import SellerLayout from '@/components/SellerLayout';

export default function SellerLayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    return <SellerLayout>{children}</SellerLayout>;
}
