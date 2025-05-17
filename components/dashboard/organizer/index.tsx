"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Users,
  Trophy,
  Book,
  Lock,
  Settings,
  FileText,
  BarChart,
  FolderKanban,
} from "lucide-react";
import {
  EventDetails,
  EventRole,
  EventScoringConfig,
  EventTrack,
  ScoringCriterion,
} from "@/lib/types";

// Tab components
import { PrizesTab } from "./prizes";
import { RulesTab } from "./rules";
import { TracksTab } from "./tracks";
import { SubmissionsTab } from "./submissions";
import { ScoresTab } from "./scores";
import { EventDetailsTab } from "./details";
import { PasswordTab } from "./password";
import { ParticipantsTab } from "./participants";

export function OrganizerDashboard({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scoringConfig, setScoringConfig] = useState<EventScoringConfig | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("details");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchEvent() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const userId = session.user.id;

        // Check if user is an organizer for this event
        const { data: roleData } = await supabase
          .from("user_event_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("event_id", eventId)
          .eq("role", EventRole.Organizer)
          .maybeSingle();

        if (!roleData) {
          toast({
            title: "Error",
            description: "You don't have permission to edit this event",
            variant: "destructive",
          });
          router.push("/organizer/dashboard");
          return;
        }

        const { data: eventData, error } = await supabase
          .from("events")
          .select(
            `
            *,
            event_tracks (
              track_id,
              name,
              description,
              label,
              scoring_criteria,
              prizes (
                id,
                prize_amount,
                prize_description
              )
            )
          `
          )
          .eq("event_id", eventId)
          .single();

        if (error) throw error;
        setEvent(eventData);

        // Map event tracks to scoring_config structure if needed
        if (eventData && eventData.event_tracks) {
          const tracksConfig: Record<string, any> = {};

          eventData.event_tracks.forEach((track: EventTrack) => {
            if (track.track_id && track.scoring_criteria) {
              tracksConfig[track.track_id] = {
                name: track.name,
                criteria: track.scoring_criteria.criteria.map(
                  (criterion: ScoringCriterion) => ({
                    id: criterion.id,
                    name: criterion.name,
                    description: criterion.description,
                    weight: criterion.weight || 1,
                    min: criterion.min || 1,
                    max: criterion.max || 10,
                  })
                ),
              };
            }
          });

          const scoreConfig = {
            tracks: tracksConfig,
            defaultMin: 1,
            defaultMax: 10,
            defaultWeight: 1,
          };
          setScoringConfig(scoreConfig);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Event not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-8 gap-4 mb-6">
          <TabsTrigger value="details" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Event Details
          </TabsTrigger>
          <TabsTrigger value="prizes" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Prizes
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="passwords" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password
          </TabsTrigger>
          <TabsTrigger value="tracks" className="flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Tracks
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Live Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <EventDetailsTab
            event={event}
            setEvent={setEvent}
            saving={saving}
            setSaving={setSaving}
            router={router}
            toast={toast}
          />
        </TabsContent>

        <TabsContent value="prizes">
          <PrizesTab
            event={event}
            setEvent={setEvent}
            saving={saving}
            setSaving={setSaving}
            toast={toast}
          />
        </TabsContent>

        <TabsContent value="rules">
          <RulesTab
            event={event}
            setEvent={setEvent}
            saving={saving}
            setSaving={setSaving}
            toast={toast}
          />
        </TabsContent>

        <TabsContent value="passwords">
          <PasswordTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="tracks">
          <TracksTab
            eventId={eventId}
            event={event}
            setEvent={setEvent}
            scoringConfig={scoringConfig}
            setScoringConfig={setScoringConfig}
            saving={saving}
            setSaving={setSaving}
            toast={toast}
          />
        </TabsContent>

        <TabsContent value="participants">
          <ParticipantsTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsTab eventId={eventId} />
        </TabsContent>

        <TabsContent value="scores">
          <ScoresTab
            eventId={eventId}
            scoringConfig={
              scoringConfig || {
                tracks: {},
                defaultMin: 1,
                defaultMax: 10,
                defaultWeight: 1,
              }
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
