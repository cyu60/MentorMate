"use client";

import { ProjectSubmissionFormComponent } from "@/components/ProjectSubmissionForm";
import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ProjectSubmissionPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const supabase = createClient();

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
  }, [supabase]);

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
