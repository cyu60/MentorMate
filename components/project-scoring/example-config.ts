import { TrackScoringConfig } from "@/lib/types";
import { SupabaseClient } from "@supabase/supabase-js";

// Example scoring configuration with different question types
export const exampleScoringConfig: TrackScoringConfig = {
  name: "Demo Track Scoring",
  criteria: [
    {
      id: "innovation",
      name: "Innovation Level",
      description: "How innovative is this project?",
      type: "numeric",
      min: 1,
      max: 10,
      weight: 3
    },
    {
      id: "technology",
      name: "Technology Choice",
      description: "Rate the technology choices for this project",
      type: "multiplechoice",
      options: [
        "Poor technology choices",
        "Acceptable technology choices",
        "Good technology choices",
        "Excellent technology choices"
      ],
      weight: 2
    },
    {
      id: "usability",
      name: "User Experience",
      description: "The product is intuitive and easy to use",
      weight: 2,
      type: "numeric",
      min: 1,
      max: 10
    },
    {
      id: "design",
      name: "Visual Design",
      description: "How visually appealing is the project?",
      weight: 1,
      type: "numeric",
      min: 1,
      max: 10
    }
  ]
};

// Example for how to create a track with this scoring config
export async function createExampleTrack(supabase: SupabaseClient, eventId: string) {
  const { data, error } = await supabase
    .from("event_tracks")
    .insert({
      event_id: eventId,
      name: "Demo Track with Different Question Types",
      description: "A demonstration track with multiple question types",
      scoring_criteria: exampleScoringConfig,
    })
    .select();

  if (error) {
    console.error("Error creating demo track:", error);
    return null;
  }

  return data?.[0] || null;
} 