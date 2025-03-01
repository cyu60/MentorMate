"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/sidebar";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Define public paths that don't require authentication
  const BASE_PUBLIC_PATHS = ["/", "/login", "/select", "/auth/callback"];
  const PUBLIC_PATH_PATTERNS = [
    ...BASE_PUBLIC_PATHS,
    /^\/public-project($|\/.*$)/, // Matches /public-project and all its sub-routes
  ];

  // Helper function to check if the current path is public
  const isPublicPath = (path: string) => {
    return PUBLIC_PATH_PATTERNS.some((pattern) =>
      typeof pattern === "string" ? pattern === path : pattern.test(path)
    );
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session && !error);
      setIsLoading(false);

      // Only redirect if not authenticated and not on a public path
      if (!session && !isPublicPath(pathname)) {
        router.push("/");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (!session && !isPublicPath(pathname)) {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

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
