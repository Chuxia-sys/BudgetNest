'use client';

import { useEffect, useRef } from 'react';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Component to handle Google Sign-In redirect results
 * This should be placed in the root layout to catch redirect results when user returns from Google
 */
export function GoogleAuthHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only check once per mount to avoid duplicate checks
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const checkRedirectResult = async () => {
      console.log('🔍 Checking for Google redirect result...');

      try {
        // Check if there's a pending redirect result from Google
        const result = await getRedirectResult(auth);

        if (result?.user) {
          console.log('✅ Google redirect result received:', result.user.email);
          console.log('👤 User signed in successfully via redirect');

          // Redirect to dashboard if on auth page
          if (pathname === '/auth') {
            console.log('🔄 Redirecting to dashboard...');
            router.push('/');
          }
        } else {
          console.log('ℹ️ No pending redirect result');
        }
      } catch (error: any) {
        // Only log actual errors, not normal "no pending credential" state
        if (error?.code && !error.code.includes('no-pending') && !error.code.includes('cancelled')) {
          console.error('❌ Google redirect error:', error.code);

          if (error.code === 'auth/unauthorized-domain') {
            console.error('⚠️ DOMAIN NOT AUTHORIZED');
            console.error(`Add "${window.location.hostname}" to Firebase Console → Authentication → Settings → Authorized domains`);
          }
        }
      }
    };

    // Only run in browser
    if (typeof window !== 'undefined') {
      checkRedirectResult();
    }
  }, [pathname, router]);

  return null;
}
