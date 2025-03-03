"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/sidebar";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Define public paths that don't require authentication
  const publicPaths = ['/', '/login', '/select', '/auth/callback'];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      setIsAuthenticated(!!session && !error);
      setIsLoading(false);

      // Only redirect if not authenticated and not on a public path
      if (!session && !publicPaths.includes(pathname)) {
        router.push('/');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session && !publicPaths.includes(pathname)) {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, publicPaths]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <>
      {isAuthenticated && <Sidebar />}
      {children}
    </>
  );
}