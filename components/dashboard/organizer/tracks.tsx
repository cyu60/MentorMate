"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoringConfigForm } from "@/components/scoring/scoring-config-form";
import { EventDetails, EventScoringConfig, EventTrack } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface TracksTabProps {
  eventId: string;
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  scoringConfig: EventScoringConfig | null;
  setScoringConfig: React.Dispatch<
    React.SetStateAction<EventScoringConfig | null>
  >;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export function TracksTab({
  eventId,
  event,
  setEvent,
  scoringConfig,
  setScoringConfig,
  saving,
  setSaving,
  toast,
}: TracksTabProps) {
  const handleScoreUpdate = async (config: EventScoringConfig) => {
    try {
      setSaving(true);

      // Store the updated config in state
      setScoringConfig(config);

      // Prepare all tracks for upsert
      const tracksToUpsert = Object.entries(config.tracks).map(
        ([trackId, trackConfig]) => ({
          track_id: trackId,
          event_id: eventId,
          name: trackConfig.name,
          description: trackConfig.name, // Default description is same as name
          scoring_criteria: {
            name: trackConfig.name,
            criteria: trackConfig.criteria,
          },
        })
      );

      // Perform upsert on all tracks at once
      const { error } = await supabase
        .from("event_tracks")
        .upsert(tracksToUpsert, {
          onConflict: "track_id",
          ignoreDuplicates: false,
        });

      if (error) throw error;

      // Refresh the tracks data
      const { data: refreshedTracks } = await supabase
        .from("event_tracks")
        .select(
          `
          *,
          prizes (
            id,
            prize_amount,
            prize_description
          )
        `
        )
        .eq("event_id", eventId);

      if (refreshedTracks && event) {
        const updatedEvent = {
          ...event,
          event_tracks: refreshedTracks as unknown as EventTrack[],
        };
        setEvent(updatedEvent);
      }

      toast({
        title: "Success",
        description: "Scoring configuration saved successfully",
      });
    } catch (error) {
      console.error("Error saving scoring config:", error);
      toast({
        title: "Error",
        description: "Failed to save scoring configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Tracks</CardTitle>
      </CardHeader>
      <CardContent>
        <ScoringConfigForm
          initialConfig={scoringConfig}
          isSubmitting={saving}
          onSave={handleScoreUpdate}
        />
      </CardContent>
    </Card>
  );
}
