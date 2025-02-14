"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// import { Hero } from "@/components/Hero";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { LandingHero } from "@/components/LandingHero";
import { supabase } from "@/lib/supabase";
// import { BackgroundBeams } from "@/components/ui/background-beams";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
      
      if (session) {
        const returnUrl = localStorage.getItem('returnUrl');
        if (returnUrl) {
          localStorage.removeItem('returnUrl');
          router.push(returnUrl);
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return null; 
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
      <Navbar />
      {/* <BackgroundBeams /> */}
      {/* {isLoggedIn ? <Hero /> : <LandingHero />} */}
      <LandingHero />
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  );
}
