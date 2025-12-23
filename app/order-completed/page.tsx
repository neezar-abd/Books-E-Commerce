import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderCompleted from '@/components/OrderCompleted';

export default function OrderCompletedPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <OrderCompleted />
      </Suspense>
      <Footer />
    </>
  );
}
