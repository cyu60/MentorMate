"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function AuthRedirectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check for participant redirect
    const shouldRedirectToParticipant = localStorage.getItem('redirectToParticipant');
    // Check for mentor redirect
    const shouldRedirectToMentor = localStorage.getItem('redirectToMentor');

    if (!shouldRedirectToParticipant && !shouldRedirectToMentor) return;

    // Check immediately if we're already signed in
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && !error) {
        if (shouldRedirectToParticipant) {
          localStorage.removeItem('redirectToParticipant');
          router.push('/participant');
        } else if (shouldRedirectToMentor) {
          localStorage.removeItem('redirectToMentor');
          router.push('/mentor');
        }
      }
    };
    checkSession();

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        if (shouldRedirectToParticipant) {
          localStorage.removeItem('redirectToParticipant');
          router.push('/participant');
        } else if (shouldRedirectToMentor) {
          localStorage.removeItem('redirectToMentor');
          router.push('/mentor');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <>{children}</>;
}