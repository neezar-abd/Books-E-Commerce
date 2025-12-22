'use client';

import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Checkout from '@/components/Checkout';
import Payment from '@/components/Payment';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'checkout';

  return (
    <>
      <Header />
      {step === 'payment' ? <Payment /> : <Checkout />}
      <Footer />
    </>
  );
}
