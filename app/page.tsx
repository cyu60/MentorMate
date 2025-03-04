"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { LandingHero } from "@/components/LandingHero";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
        <LandingHero />
        <ServiceWorkerRegistration />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl sm:text-6xl font-extrabold mb-6"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-300">
            Welcome to MentorMates
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <TextGenerateEffect
            words="Find your event to start getting personalized feedback and guidance for your projects."
            className="text-xl text-gray-700 max-w-3xl mx-auto mb-10"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6"
        >
          <Link href="/events">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Browse Events
            </Button>
          </Link>
        </motion.div>
      </div>
      <ServiceWorkerRegistration />
    </div>
  ); 
}