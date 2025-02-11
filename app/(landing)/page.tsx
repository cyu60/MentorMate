"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/Hero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LandingHero } from "@/components/LandingHero";
import { supabase } from "@/lib/supabase";
// import { BackgroundBeams } from "@/components/ui/background-beams";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSelection, setShowSelection] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error checking session:", error);
        setIsLoading(false);
        return;
      }
      setIsLoggedIn(!!session);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  useEffect(() => {
    // Check if we came from the "Get Started" button
    const params = new URLSearchParams(window.location.search);
    setShowSelection(params.get('selection') === 'true');
  }, []);

  if (isLoading) {
    return null; // or a loading spinner if preferred
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100">
      <Navbar />
      {/* <BackgroundBeams /> */}
      {isLoggedIn || showSelection ? <Hero /> : <LandingHero />}
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  );
}
