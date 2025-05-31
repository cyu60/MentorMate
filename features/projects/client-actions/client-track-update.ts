import { supabase } from "@/lib/supabase";
import { EventTrack } from "@/lib/types";
import { PostgrestError } from "@supabase/supabase-js";

interface ProjectTrackResponse {
  event_tracks: EventTrack[];
}

// Fetch available tracks for an event
export async function fetchEventTracks(
  eventId: string
): Promise<{ data: EventTrack[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from("event_tracks")
    .select(`
      track_id,
      event_id,
      name,
      description,
      label,
      scoring_criteria,
      created_at,
      updated_at,
      prizes (
        id,
        prize_amount,
        prize_description
      )
    `)
    .eq("event_id", eventId)
    .order("name");

  return { data, error };
}

// Fetch current tracks for a project
export async function fetchProjectTracks(
  projectId: string
): Promise<{ data: EventTrack[] | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from("project_tracks")
    .select(`
      event_tracks (
        track_id,
        event_id,
        name,
        description,
        label,
        scoring_criteria,
        created_at,
        updated_at,
        prizes (
          id,
          prize_amount,
          prize_description
        )
      )
    `)
    .eq("project_id", projectId);

  if (error) {
    return { data: null, error };
  }

  // Extract the event_tracks from the nested structure and properly type it
  const tracks = data?.flatMap((item: ProjectTrackResponse) => item.event_tracks).filter(Boolean) || [];
  return { data: tracks, error: null };
}

// Update project tracks (replace all tracks for the project)
export async function updateProjectTracks(
  projectId: string,
  trackIds: string[]
): Promise<{ success: boolean; error: PostgrestError | null }> {
  // Start a transaction by first deleting existing tracks, then inserting new ones
  
  // Delete existing project tracks
  const { error: deleteError } = await supabase
    .from("project_tracks")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    return { success: false, error: deleteError };
  }

  // Insert new project tracks if any are provided
  if (trackIds.length > 0) {
    const trackInserts = trackIds.map(trackId => ({
      project_id: projectId,
      track_id: trackId,
    }));

    const { error: insertError } = await supabase
      .from("project_tracks")
      .insert(trackInserts);

    if (insertError) {
      return { success: false, error: insertError };
    }
  }

  return { success: true, error: null };
}

// Add a single track to a project
export async function addProjectTrack(
  projectId: string,
  trackId: string
): Promise<{ success: boolean; error: PostgrestError | null }> {
  const { error } = await supabase
    .from("project_tracks")
    .insert({
      project_id: projectId,
      track_id: trackId,
    });

  return { success: !error, error };
}

// Remove a single track from a project
export async function removeProjectTrack(
  projectId: string,
  trackId: string
): Promise<{ success: boolean; error: PostgrestError | null }> {
  const { error } = await supabase
    .from("project_tracks")
    .delete()
    .eq("project_id", projectId)
    .eq("track_id", trackId);

  return { success: !error, error };
} 