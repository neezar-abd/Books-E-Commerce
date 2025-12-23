'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Checkout from '@/components/Checkout';
import Payment from '@/components/Payment';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'checkout';

  return step === 'payment' ? <Payment /> : <Checkout />;
}

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
      <Footer />
    </>
  );
}
