"use client";

import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useEventRegistration } from "@/components/event-registration-provider";
import { EventRole } from "@/lib/types";
import { ParticipantDashboard } from "@/components/dashboard/participant-dashboard";
import { JudgeDashboard } from "@/components/dashboard/judge-dashboard";
import { MentorDashboard } from "@/components/dashboard/mentor-dashboard";
import { OrganizerDashboard } from "@/components/dashboard/organizer";
import { useState, useEffect } from "react";
import { isValidUUID } from "@/app/utils/supabase/queries";

export default function DashboardPage() {
  const params = useParams();
  const slug = params.id as string;
  const [eventId, setEventId] = useState<string | null>(null);
  const { userRole } = useEventRegistration();
  const [loading, setLoading] = useState(true);

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
    // Simulate loading time for the dashboard, give time for the data to load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!eventId) {
    return <div>Loading...</div>;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case EventRole.Participant:
        return <ParticipantDashboard eventId={eventId} />;
      case EventRole.Judge:
        return <JudgeDashboard eventId={eventId} />;
      case EventRole.Mentor:
        return <MentorDashboard eventId={eventId} />;
      case EventRole.Admin:
      case EventRole.Organizer:
        return <OrganizerDashboard eventId={eventId} />;

      default:
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold">Access Denied</h2>
            <p className="text-gray-600">
              You do not have access to this dashboard.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {loading ? (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      ) : (
        renderDashboard()
      )}
    </div>
  );
}
