import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrackOrder from '@/components/TrackOrder';

export default function TrackOrderPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <TrackOrder />
      </Suspense>
      <Footer />
    </>
  );
}
