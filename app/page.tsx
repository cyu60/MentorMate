"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ServiceWorkerRegistration } from "@/components/utils/ServiceWorkerRegistration";
import { LandingHero } from "@/components/heroes/LandingHero";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Navbar } from "@/components/layout/navbar";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, Folder, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // stats
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [totalEvents, setTotalEvents] = useState(0);
  const [submittedProjects, setSubmittedProjects] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);

  useEffect(() => {
    const syncUserProfile = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          const user = currentSession.user;

          const profileData = {
            uid: user.id,
            email: user.email,
            display_name: user.user_metadata.full_name,
          };

          const { data: profile, error } = await supabase
            .from("user_profiles")
            .upsert(profileData, {
              onConflict: "email",
            })
            .select();

          if (error) {
            console.error("Error syncing profile:", error);
          } else {
            console.log("Successfully synced profile:", profile);
          }
        }

        setSession(currentSession);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in syncUserProfile:", error);
        setIsLoading(false);
      }
    };

    syncUserProfile();
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.email) return;
      setIsLoadingStats(true);

      // Get uid from user_profiles using email from auth session
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("uid")
        .eq("email", session.user.email)
        .single();

      if (profileError || !userProfile) {
        toast({
          title: "Error finding user profile",
          description: "Please try again later",
          variant: "destructive",
        });
        return;
      }

      const userId = userProfile.uid;
      const userEmail = session.user.email;

      // TOTAL EVENTS
      const { data: userEventRoles } = await supabase
        .from("user_event_roles")
        .select("event_id")
        .eq("user_id", userId);

      const totalEventsCount = userEventRoles?.length ?? 0;

      // SUBMITTED PROJECTS
      const { data: leadProjects } = await supabase
        .from("projects")
        .select("*")
        .eq("lead_email", userEmail);

      const { data: teamProjects } = await supabase
        .from("projects")
        .select("*")
        .contains("teammates", [userEmail]);

      const combinedProjects = [
        ...(leadProjects || []),
        ...(teamProjects || []),
      ].filter(
        (proj, idx, arr) => idx === arr.findIndex((p) => p.id === proj.id)
      );

      const submittedProjectsCount = combinedProjects.length;

      // FEEDBACK RECEIVED
      const { data: userFeedback } = await supabase
        .from("feedback")
        .select("*")
        .eq("recipient_email", userEmail);

      const totalFeedbackCount = userFeedback?.length || 0;

      // Save to state
      setTotalEvents(totalEventsCount);
      setSubmittedProjects(submittedProjectsCount);
      setFeedbackCount(totalFeedbackCount);

      setIsLoadingStats(false);
    };

    if (session?.user?.email) {
      fetchStats();
    }
  }, [session]);

  if (isLoading) {
    return null;
  }

  if (!session) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-white to-blue-100 pb-4">
        <Navbar />
        <LandingHero />
        <ServiceWorkerRegistration />
        <div className="pt-10">
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <AuthNavbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-3">
              Welcome to MentorMates
            </h1>
            <TextGenerateEffect
              words="Find your event to start getting personalized feedback and guidance for your projects."
              className="text-lg text-gray-700 max-w-2xl font-light"
            />
            <div className="mt-5">
              {/* <Link href="/events">
                <Button className="bg-blue-900 hover:bg-blue-800 text-white px-6 text-md rounded-full shadow transition-all">
                  Browse Events
                </Button>
              </Link> */}
            </div>
          </motion.div>

          {/* Stats Section */}
          {isLoadingStats ? (
            <div className="h-20 flex items-center justify-center">
              <p className="text-gray-500">Loading stats...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* 1) Total Events */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <p className="text-gray-500">Total Events</p>
                <h2 className="text-3xl font-bold text-blue-900">
                  {totalEvents}
                </h2>
              </motion.div>

              {/* 2) Submitted Projects */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <p className="text-gray-500">Submitted Projects</p>
                <h2 className="text-3xl font-bold text-blue-900">
                  {submittedProjects}
                </h2>
              </motion.div>

              {/* 3) Feedback Received */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-6 rounded-lg shadow"
              >
                <p className="text-gray-500">Feedback Received</p>
                <h2 className="text-3xl font-bold text-blue-900">
                  {feedbackCount}
                </h2>
              </motion.div>
            </div>
          )}

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow rounded-lg p-6 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <Calendar className="w-8 h-8 text-blue-900 mr-2" />
                <h2 className="text-xl font-bold text-blue-900">Events</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Check your upcoming events or create new ones.
              </p>
              <Link href="/events" className="mt-auto">
                <Button className="bg-blue-900 text-white">View Events</Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white shadow rounded-lg p-6 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <Folder className="w-8 h-8 text-blue-900 mr-2" />
                <h2 className="text-xl font-bold text-blue-900">Projects</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Track and update your project progress.
              </p>
              <Link href="/my-project-gallery" className="mt-auto">
                <Button className="bg-blue-900 text-white">
                  View Projects
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white shadow rounded-lg p-6 flex flex-col"
            >
              <div className="flex items-center mb-4">
                <MessageSquare className="w-8 h-8 text-blue-900 mr-2" />
                <h2 className="text-xl font-bold text-blue-900">Feedback</h2>
              </div>
              <p className="text-gray-600 mb-4">
                Review the feedback you have provided.
              </p>
              <Link href="/feedback/given" className="mt-auto">
                <Button className="bg-blue-900 text-white">
                  View Feedback
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <ServiceWorkerRegistration />
      <Footer />
    </div>
  );
}
