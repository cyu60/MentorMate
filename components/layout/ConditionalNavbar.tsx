"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { AuthNavbar } from "./authNavbar";
import { Navbar } from "./navbar";

export function ConditionalNavbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Don't render anything while loading to prevent flash
  if (isLoading) {
    return null;
  }

  // Render AuthNavbar if user is authenticated, otherwise render Navbar
  return session ? <AuthNavbar /> : <Navbar />;
} 