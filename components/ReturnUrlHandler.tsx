"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from 'cookies-next';

export function ReturnUrlHandler() {
  const router = useRouter();

  useEffect(() => {
    const shouldGetReturnUrl = getCookie('getReturnUrl');
    if (shouldGetReturnUrl) {
      const returnUrl = localStorage.getItem('returnUrl');
      if (returnUrl) {
        localStorage.removeItem('returnUrl');
        deleteCookie('getReturnUrl');
        router.push(returnUrl);
      }
    }
  }, [router]);

  return null;
}