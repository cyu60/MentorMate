"use client";

import { AuthRedirectProvider } from '@/features/user/authentication/auth/AuthRedirectProvider';
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthRedirectProvider>
      {children}
      <Toaster />
    </AuthRedirectProvider>
  );
}