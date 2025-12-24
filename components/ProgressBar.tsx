'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Customize NProgress
NProgress.configure({
  minimum: 0.3,
  easing: 'ease',
  speed: 800,
  showSpinner: false,
  parent: 'body',
});

export default function ProgressBar() {
  const router = useRouter();

  useEffect(() => {
    // Handle navigation start
    const handleStart = () => {
      NProgress.start();
    };

    // Handle navigation complete
    const handleComplete = () => {
      NProgress.done();
    };

    // Listen for router events
    const handleRouteChange = () => {
      handleComplete();
    };

    // Start progress on route change
    window.addEventListener('beforeunload', handleStart);
    
    // Complete progress after navigation
    const timer = setTimeout(handleComplete, 500);

    return () => {
      window.removeEventListener('beforeunload', handleStart);
      clearTimeout(timer);
    };
  }, [router]);

  return null;
}
