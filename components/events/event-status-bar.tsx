"use client";

import { getRoleLabel } from "@/lib/utils/roles";
import { CancelRegistration } from "@/components/events/cancel-registration";
import { CheckCircle } from "lucide-react";
import { useEventRegistration } from "@/components/event-registration-provider";

interface EventStatusBarProps {
  eventId: string;
}

export function EventStatusBar({ eventId }: EventStatusBarProps) {
  const { isRegistered, userRole, roleLabels } = useEventRegistration();

  if (!isRegistered) return null;

  const roleDisplay = userRole ? getRoleLabel(userRole, roleLabels) : "Member";

  return (
    <div className="w-full rounded-md shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <span className="text-lg font-medium">
            You are participating in this event as a {roleDisplay}
          </span>
        </div>
        <div>
          <CancelRegistration
            eventId={eventId}
            onCancel={async () => {
              window.location.reload();
              return Promise.resolve();
            }}
          />
        </div>
      </div>
    </div>
  );
}
