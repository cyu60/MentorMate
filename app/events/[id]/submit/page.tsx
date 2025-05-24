"use client";

import { ProjectSubmissionFormComponent } from "@/components/projects/ProjectSubmissionForm";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { isValidUUID } from "@/app/utils/supabase/queries";

// Project Submission Page
export default function ProjectSubmissionPage() {
  const params = useParams();
  const slug = params.id as string;
  const [eventId, setEventId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const resolveEventId = async () => {
      const isUUID = isValidUUID(slug);

      let query = supabase.from("events").select("event_id");

      if (isUUID) {
        // If it's a UUID, check both slug and event_id
        query = query.or(`slug.eq.${slug},event_id.eq.${slug}`);
      } else {
        // If it's not a UUID, only check slug
        query = query.eq("slug", slug);
      }

      const { data } = await query.maybeSingle();
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
