"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PathPattern = string | RegExp;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Define public paths that don't require authentication using useMemo
  const PUBLIC_PATH_PATTERNS = useMemo(() => {
    const BASE_PUBLIC_PATHS = [
      "/",
      "/login",
      "/auth/callback",
      "/auth/auth-code-error",
      "/about",
      "/teams",
    ];
    return [
      ...BASE_PUBLIC_PATHS,
      /^\/public-project-details($|\/.*$)/, // Matches /public-project and all its sub-routes
      /^\/events($|\/.*$)/, // Matches /events and all its sub-routes
      /^\/profile\/[a-zA-Z0-9_-]+($|\/.*$)/, // Matches /profile/user-id and all its sub-routes
    ];
  }, []);

  // Wrap isPublicPath in useCallback to prevent recreation on each render
  const isPublicPath = useCallback(
    (path: string) => {
      return PUBLIC_PATH_PATTERNS.some((pattern: PathPattern) =>
        typeof pattern === "string" ? pattern === path : pattern.test(path)
      );
    },
    [PUBLIC_PATH_PATTERNS]
  );

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      setIsLoading(false);

      // Only redirect if (not authenticated or error) and not on a public path
      if ((!session || error) && !isPublicPath(pathname)) {
        router.push("/");
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session && !isPublicPath(pathname)) {
        router.push("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, isPublicPath]);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
