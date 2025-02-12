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
    const shouldRedirectToParticipant = localStorage.getItem('redirectToParticipant');
    const shouldRedirectToMentor = localStorage.getItem('redirectToMentor');

    if (!shouldRedirectToParticipant && !shouldRedirectToMentor) return;

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