"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoringConfigForm } from "@/components/scoring/scoring-config-form";
import {
  EventDetails,
  EventScoringConfig,
  EventTrack,
  JudgingMode,
} from "@/lib/types";
import { supabase } from "@/lib/supabase";

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
  toast: (props: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => void;
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
  const [tracks, setTracks] = useState<EventTrack[]>([]);

  const handleJudgingModeUpdate = (trackId: string, mode: JudgingMode) => {
    // Update the tracks in state
    setTracks((prevTracks) =>
      prevTracks.map((track) =>
        track.track_id === trackId ? { ...track, judging_mode: mode } : track
      )
    );

    // Trigger a reload of the tracks data to get the updated criteria
    fetchTracks();
  };

  // Function to fetch tracks data
  const fetchTracks = async () => {
    const { data, error } = await supabase
      .from("event_tracks")
      .select("*")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching tracks:", error);
      toast({
        title: "Error",
        description: "Failed to load track data",
        variant: "destructive",
      });
    } else {
      setTracks(data || []);
    }
  };

  // Fetch existing tracks to get judging_mode values
  useEffect(() => {
    fetchTracks();
  }, [eventId, toast]);

  const handleScoreUpdate = async (config: EventScoringConfig) => {
    try {
      setSaving(true);

      // Store the updated config in state
      setScoringConfig(config);

      // Preserve judging_mode when updating tracks
      const tracksToUpsert = Object.entries(config.tracks).map(
        ([trackId, trackConfig]) => {
          // Find existing track to get judging_mode if available
          const existingTrack = tracks.find((t) => t.track_id === trackId);

          return {
            track_id: trackId,
            event_id: eventId,
            name: trackConfig.name,
            description: trackConfig.name, // Default description is same as name
            scoring_criteria: {
              name: trackConfig.name,
              criteria: trackConfig.criteria,
            },
            // Preserve existing judging_mode or default to traditional
            judging_mode:
              existingTrack?.judging_mode || JudgingMode.Traditional,
          };
        }
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
        const updatedTracks = refreshedTracks as unknown as EventTrack[];
        setTracks(updatedTracks);

        const updatedEvent = {
          ...event,
          event_tracks: updatedTracks,
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
    <div className="space-y-6">
      {/* Track Configuration with integrated judging modes */}
      <Card>
        <CardHeader>
          <CardTitle>Event Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Configure your event tracks below. For each track, you can set up
            scoring criteria and choose the judging interface (traditional
            scoring or investment decision).
          </p>

          <ScoringConfigForm
            initialConfig={scoringConfig}
            isSubmitting={saving}
            onSave={handleScoreUpdate}
            tracks={tracks}
            onJudgingModeUpdate={handleJudgingModeUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
