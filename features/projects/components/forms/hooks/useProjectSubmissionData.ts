import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { UUID } from "crypto";

interface Track {
  id: string;
  name: string;
}

export function useProjectSubmissionData(eventId: string) {
  const [allUsers, setAllUsers] = useState<string[]>([]);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user emails
        const { data: userData, error: userError } = await supabase
          .from("user_event_roles")
          .select("user_id, user_profiles!user_id(email)")
          .eq("role", "participant")
          .eq("event_id", eventId)
          .overrideTypes<
            Array<{
              user_id: UUID;
              user_profiles: {
                email: string;
              };
            }>
          >();

        if (userError) {
          console.error("Error fetching user display names:", userError);
        } else if (userData) {
          const emails = userData.map((user) => user.user_profiles.email);
          setAllUsers(emails);
        }

        // Fetch event tracks
        const { data: trackData, error: trackError } = await supabase
          .from("event_tracks")
          .select("track_id, name")
          .eq("event_id", eventId);

        if (trackError) {
          console.error("Error fetching event tracks:", trackError);
        } else if (trackData) {
          const tracks = trackData.map((track) => ({
            id: track.track_id,
            name: track.name,
          }));
          setAvailableTracks(tracks);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  return { allUsers, availableTracks, isLoading };
}