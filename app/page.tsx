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
import { Footer } from "@/components/footer";
import { Calendar, Folder, MessageSquare } from "lucide-react";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const syncUserProfile = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        console.log('Current Session:', currentSession);
        
        if (currentSession?.user) {
          console.log('Syncing user profile...');
          const user = currentSession.user;
          
          const profileData = {
            email: user.email,
            display_name: user.user_metadata.full_name,
            events: [],
            pulse: 0
          };
          console.log('Profile data to sync:', profileData);

          const { data: profile, error } = await supabase
            .from('user_profiles')
            .upsert(profileData, {
              onConflict: 'email'
            })
            .select();

          if (error) {
            console.error('Error syncing profile:', error);
          } else {
            console.log('Successfully synced profile:', profile);
          }
        }
        
        setSession(currentSession);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in syncUserProfile:', error);
        setIsLoading(false);
      }
    };

    syncUserProfile();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
        <LandingHero />
        <ServiceWorkerRegistration />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] w-full pb-4 bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center justify-center text-center">
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
            className="text-xl text-gray-700 max-w-3xl mx-auto font-light"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6"
        >
          <Link href="/events">
            <Button className="bg-blue-900 hover:bg-blue-800 text-white px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              Browse Events
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-5 pr-5">
        {/* Events Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white shadow rounded-lg p-6 flex flex-col items-center"
        >
          <Calendar className="w-12 h-12 text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Events</h2>
          <p className="text-gray-600 text-center">
            See your upcoming events.
          </p>
          <Link href="/events" className="mt-4">
            <Button className="bg-blue-900 text-white">View Events</Button>
          </Link>
        </motion.div>
        {/* Projects Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white shadow rounded-lg p-6 flex flex-col items-center"
        >
          <Folder className="w-12 h-12 text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Projects</h2>
          <p className="text-gray-600 text-center">
            Track your project progress.
          </p>
          <Link href="/my-projects" className="mt-4">
            <Button className="bg-blue-900 text-white">View Projects</Button>
          </Link>
        </motion.div>
        {/* Feedback Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white shadow rounded-lg p-6 flex flex-col items-center"
        >
          <MessageSquare className="w-12 h-12 text-blue-900 mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Feedback</h2>
          <p className="text-gray-600 text-center">
            Review feedback on your submissions.
          </p>
          <Link href="/feedback" className="mt-4">
            <Button className="bg-blue-900 text-white">View Feedback</Button>
          </Link>
        </motion.div>
      </div>
      <ServiceWorkerRegistration />
      <Footer />
    </div>
  ); 
}