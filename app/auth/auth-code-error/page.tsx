'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AuthCodeError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-4 text-2xl font-bold text-red-600">Authentication Error</h1>
        
        {error === 'missing_email' ? (
          <p className="mb-6 text-gray-600">
            We couldn&apos;t complete your mentor registration because no email address was found.
            Please ensure you&apos;re using an account with a valid email address.
          </p>
        ) : (
          <p className="mb-6 text-gray-600">
            We encountered an error while trying to authenticate your account.
            This could be due to an expired or invalid authentication code.
          </p>
        )}

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/select">
              Try Again
            </Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}