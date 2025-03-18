"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { CancelRegistration } from "@/components/events/cancel-registration";
import { CheckCircle } from "lucide-react";

interface EventStatusBarProps {
  eventId: string;
}

export function EventStatusBar({ eventId }: EventStatusBarProps) {
  const [hasJoined, setHasJoined] = useState(false);

  const checkJoinStatus = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("events")
        .eq("email", session.user.email)
        .single();

      if (data?.events && Array.isArray(data.events)) {
        setHasJoined(data.events.includes(eventId));
      }
    } catch (error) {
      console.error("Error checking join status:", error);
    }
  }, [eventId]);

  useEffect(() => {
    checkJoinStatus();
  }, [checkJoinStatus]);

  if (!hasJoined) return null;

  return (
    <div className="w-full rounded-md shadow-md bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <span className="text-lg font-medium">
            You are participating in this event
          </span>
        </div>
        <div>
          <CancelRegistration eventId={eventId} onCancel={checkJoinStatus} />
        </div>
      </div>
    </div>
  );
}
