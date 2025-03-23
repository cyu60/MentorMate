"use client";

import { useParams } from "next/navigation";
import { useEventRegistration } from "@/components/event-registration-provider";
import { EventRole } from "@/lib/types";
import { ParticipantDashboard } from "@/components/dashboard/participant-dashboard";
import { JudgeDashboard } from "@/components/dashboard/judge-dashboard";
import { MentorDashboard } from "@/components/dashboard/mentor-dashboard";
import { OrganizerDashboard } from "@/components/dashboard/organizer-dashboard";

export default function DashboardPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { userRole } = useEventRegistration();

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

  return <div className="space-y-8">{renderDashboard()}</div>;
}
