"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Navbar } from '@/components/layout/navbar';
import { ReturnUrlHandler } from '@/components/auth/ReturnUrlHandler';
import { ProjectSubmissionFormComponent } from '@/components/projects/ProjectSubmissionForm';

export default function SubmitPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        router.push("/select");
        return;
      }
      if (!session) {
        router.push("/select");
      } else {
        setSession(session);
      }
    };
    fetchSession();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80 pb-10">
      <Navbar />
      <ReturnUrlHandler />
      <div>
        <main className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
            Submit Your Project
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 px-4 sm:px-6 md:px-8 lg:px-40"
          >
            <Card className="bg-white backdrop-blur-md border-blue-200/20">
              <CardContent>
                <ProjectSubmissionFormComponent
                  userEmail={session?.user?.email}
                  leadName={session?.user?.user_metadata?.full_name}
                  eventId={eventId}
                  onProjectSubmitted={() => {
                    router.push(`/events/${eventId}/participant`);
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
