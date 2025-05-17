"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { EventRole, JudgingMode } from "@/lib/types";
import { DefaultScoring } from "./default-scoring";
import { InvestorView } from "./investor-view";
import { getRoleLabel } from "@/lib/utils/roles";

interface ScoringControllerProps {
  projectId: string;
  eventId: string;
  judgeId: string;
  trackId: string;
}

export function ScoringController({
  projectId,
  eventId,
  judgeId,
  trackId,
}: ScoringControllerProps) {
  const [loading, setLoading] = useState(true);
  const [isInvestorMode, setIsInvestorMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Helper function to convert string to JudgingMode enum
  const getJudgingMode = (mode: string | undefined): JudgingMode => {
    if (!mode) return JudgingMode.Traditional;

    // Handle string values from database that may not yet be using the enum
    if (mode === "traditional") return JudgingMode.Traditional;
    if (mode === "investment") return JudgingMode.Investment;

    // If it's already an enum value, TypeScript will allow this cast
    return mode as JudgingMode;
  };

  useEffect(() => {
    async function checkEventSettings() {
      try {
        // First, check if this track has a specific judging mode
        const { data: trackData, error: trackError } = await supabase
          .from("event_tracks")
          .select("judging_mode")
          .eq("track_id", trackId)
          .single();

        if (trackError) throw trackError;

        // If track has a judging mode explicitly set, use that
        if (trackData?.judging_mode) {
          const judgingMode = getJudgingMode(trackData.judging_mode);
          setIsInvestorMode(judgingMode === JudgingMode.Investment);
          setLoading(false);
          return;
        }

        // Otherwise, fall back to checking role labels
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("role_labels")
          .eq("event_id", eventId)
          .single();

        if (eventError) throw eventError;

        const roleLabels = eventData?.role_labels || null;

        // If the judge role is labeled as "Investor", use the investor view
        const judgeLabel = getRoleLabel(EventRole.Judge, roleLabels);
        if (judgeLabel.toLowerCase() === "investor") {
          setIsInvestorMode(true);
        }
      } catch (error) {
        console.error("Error checking event settings:", error);
        setErrorMessage("Failed to load event settings");
      } finally {
        setLoading(false);
      }
    }

    checkEventSettings();
  }, [eventId, trackId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{errorMessage}</p>
      </div>
    );
  }

  if (isInvestorMode) {
    return (
      <InvestorView
        projectId={projectId}
        eventId={eventId}
        judgeId={judgeId}
        trackId={trackId}
      />
    );
  }

  // Default scoring view
  return (
    <DefaultScoring
      projectId={projectId}
      eventId={eventId}
      judgeId={judgeId}
      trackId={trackId}
    />
  );
}
