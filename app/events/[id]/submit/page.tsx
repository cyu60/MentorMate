"use client";

import { ProjectSubmissionFormComponent } from "@/components/projects/ProjectSubmissionForm";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// Project Submission Page
export default function ProjectSubmissionPage() {
  const params = useParams();
  const slug = params.id as string;
  const [eventId, setEventId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const resolveEventId = async () => {
      const { data } = await supabase
        .from("events")
        .select("event_id")
        .or(`slug.eq.${slug},event_id.eq.${slug}`)
        .maybeSingle();
      if (data) setEventId(data.event_id);
    };
    resolveEventId();
  }, [slug]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || null);
        setUserName(
          session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            null
        );

        // Get user profile data
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("uid", session.user.id)
          .single();

        if (profile) {
          setUserName(
            profile.display_name ||
              session.user.user_metadata?.full_name ||
              null
          );
        }
      }
    };
    getUser();
  }, []);

  if (!eventId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <ProjectSubmissionFormComponent
        userEmail={userEmail || ""}
        leadName={userName || ""}
        eventId={eventId}
      />
    </div>
  );
}
