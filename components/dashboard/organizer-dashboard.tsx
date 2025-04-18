"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  List,
  Trophy,
  Book,
  Lock,
  Settings,
  TrashIcon,
} from "lucide-react";
import { EventDetails, EventRole, EventScoringConfig, EventTrack, ScoringCriterion, TrackScoringConfig } from "@/lib/types";
import { RolePasswordSettings } from "./role-password-settings";
import { ScoringConfigForm } from "@/components/scoring/scoring-config-form";
import { ParticipantsList } from "./participants-list";
import { ProjectSubmissionsList } from "./project-submissions-list";
import { LiveScoresDashboard } from "./live-scores-dashboard";

interface Winner {
  projectId: string;
  trackId: string;
  totalScore: number;
  rank: number;
}

interface UpdateEventData {
  event_name?: string;
  event_date?: string;
  location?: string;
  event_description?: string;
  cover_image_url?: string;
  event_schedule?: EventDetails["event_schedule"];
  event_prizes?: EventDetails["event_prizes"];
  event_resources?: EventDetails["event_resources"];
  rules?: EventDetails["rules"];
  scoring_config?: EventScoringConfig;
  winners?: Winner[];
}

const exportParticipants = async (eventId: string) => {
  const { data } = await supabase
    .from("user_event_roles")
    .select(
      `
      user_id,
      role,
      users (
        email,
        full_name
      )
    `
    )
    .eq("event_id", eventId);

  if (data) {
    const csv = Papa.unparse(
      data?.map((row) => ({
        Name: row.users?.[0]?.full_name || "",
        Email: row.users?.[0]?.email || "",
        Role: row.role || "",
      }))
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `participants-${eventId}.csv`;
    a.click();
  }
};

const exportSubmissions = async (eventId: string) => {
  const { data } = await supabase
    .from("projects")
    .select(
      `
      project_name,
      lead_name,
      lead_email,
      project_description,
      project_url,
      teammates
    `
    )
    .eq("event_id", eventId);

  if (data) {
    const csv = Papa.unparse(
      data?.map((project) => ({
        "Project Name": project.project_name,
        "Lead Name": project.lead_name,
        "Lead Email": project.lead_email,
        Description: project.project_description,
        "Project URL": project.project_url,
        "Team Members": project.teammates.join(", "),
      }))
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions-${eventId}.csv`;
    a.click();
  }
};

const exportScores = async (eventId: string) => {
  const { data } = await supabase
    .from("project_scores")
    .select(
      `
      project_id,
      track_id,
      scores,
      comments,
      projects (
        project_name
      )
    `
    )
    .eq("event_id", eventId);

  if (data) {
    const csv = Papa.unparse(
      data?.map((score) => ({
        "Project Name": score.projects?.[0]?.project_name || "",
        Track: score.track_id || "",
        "Total Score": Object.values(score.scores || {}).reduce(
          (a: number, b: unknown) => a + (typeof b === "number" ? b : 0),
          0
        ),
        Comments: score.comments,
      }))
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scores-${eventId}.csv`;
    a.click();
  }
};

interface Winner {
  projectId: string;
  trackId: string;
  totalScore: number;
  rank: number;
}

export function OrganizerDashboard({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scoringConfig, setScoringConfig] = useState<EventScoringConfig | null>(null);
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

        // still a bit messy; need to refactor eventually
        if (eventData && eventData.event_tracks) {
          const tracksConfig: Record<string, TrackScoringConfig> = {};
          
          eventData.event_tracks.forEach((track: EventTrack) => {
            if (track.track_id && track.scoring_criteria) {
              tracksConfig[track.track_id] = {
                name: track.name,
                criteria: track.scoring_criteria.criteria.map((criterion: ScoringCriterion) => ({
                  id: criterion.id,
                  name: criterion.name,
                  description: criterion.description,
                  weight: criterion.weight || 1,
                  min: criterion.min || 1,
                  max: criterion.max || 10
                }))
              };
            }
          });
          
          const scoreConfig = {
            tracks: tracksConfig,
            defaultMin: 1,
            defaultMax: 10,
            defaultWeight: 1
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

  const updateEvent = async (data: UpdateEventData) => {
    if (!event) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("events")
        .update(data)
        .eq("event_id", event.event_id);

      if (error) throw error;

      // Update local state
      setEvent({ ...event, ...data });

      // Refresh the page to update the overview
      router.refresh();

      toast({
        title: "Success",
        description: "Changes saved successfully",
      });
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBasicInfoUpdate = () => {
    if (!event) return;
    updateEvent({
      event_name: event.event_name,
      event_date: event.event_date,
      location: event.location,
      event_description: event.event_description,
      cover_image_url: event.cover_image_url,
    });
  };

  const handleScheduleUpdate = () => {
    if (!event) return;
    updateEvent({ event_schedule: event.event_schedule });
  };

  const handlePrizesUpdate = async () => {
    if (!event || !event.event_tracks || event.event_tracks.length === 0) return;
    
    try {
      setSaving(true);
      
      // Process each track's prizes
      for (const track of event.event_tracks) {
        if (track.prizes && track.prizes.length > 0) {
          // Collect all prizes for this track for bulk upsert
          const trackPrizes = track.prizes.map(prize => ({
            id: prize.id, // Will be used as match criteria for upsert
            track_id: track.track_id,
            prize_amount: prize.prize_amount,
            prize_description: prize.prize_description,
            updated_at: new Date().toISOString()
          }));
          
          // Perform upsert operation
          const { error } = await supabase
            .from("prizes")
            .upsert(trackPrizes, { 
              onConflict: 'id',
            });
            
          if (error) throw error;
        }
      }
      
      // Refresh the tracks data
      const { data: refreshedTracks } = await supabase
        .from("event_tracks")
        .select(`
          *,
          prizes (
            id,
            prize_amount,
            prize_description
          )
        `)
        .eq("event_id", eventId);
        
      if (refreshedTracks && event) {
        const updatedEvent = { 
          ...event,
          event_tracks: refreshedTracks as unknown as EventTrack[] 
        };
        setEvent(updatedEvent);
      }
      
      toast({
        title: "Success",
        description: "Prizes updated successfully",
      });
    } catch (error) {
      console.error("Error updating prizes:", error);
      toast({
        title: "Error",
        description: "Failed to update prizes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResourcesUpdate = () => {
    if (!event) return;
    updateEvent({ event_resources: event.event_resources });
  };

  const handleRulesUpdate = () => {
    if (!event) return;
    updateEvent({ rules: event.rules });
  };

  const handleScoreUpdate = async (config: EventScoringConfig) => {
    try {
      setSaving(true);
      
      // Store the updated config in state
      setScoringConfig(config);
      
      // Prepare all tracks for upsert
      const tracksToUpsert = Object.entries(config.tracks).map(([trackId, trackConfig]) => ({
        track_id: trackId,
        event_id: eventId,
        name: trackConfig.name,
        description: trackConfig.name, // Default description is same as name
        scoring_criteria: {
          name: trackConfig.name,
          criteria: trackConfig.criteria
        }
      }));
      
      // Perform upsert on all tracks at once
      const { error } = await supabase
        .from("event_tracks")
        .upsert(tracksToUpsert, {
          onConflict: 'track_id',
          ignoreDuplicates: false
        });
        
      if (error) throw error;
      
      // Refresh the tracks data
      const { data: refreshedTracks } = await supabase
        .from("event_tracks")
        .select(`
          *,
          prizes (
            id,
            prize_amount,
            prize_description
          )
        `)
        .eq("event_id", eventId);
        
      if (refreshedTracks && event) {
        const updatedEvent = { 
          ...event,
          event_tracks: refreshedTracks as unknown as EventTrack[] 
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
            <Settings className="h-4 w-4" />
            Tracks
          </TabsTrigger>
          <TabsTrigger value="participants" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="submissions" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Submissions
          </TabsTrigger>
          <TabsTrigger value="scores" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Live Scores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_name">Event Name</Label>
                    <Input
                      id="event_name"
                      value={event.event_name}
                      onChange={(e) =>
                        setEvent({ ...event, event_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_date">Event Date</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={event.event_date}
                      onChange={(e) =>
                        setEvent({ ...event, event_date: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={event.location}
                      onChange={(e) =>
                        setEvent({ ...event, location: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event_description">Description</Label>
                    <Textarea
                      id="event_description"
                      value={event.event_description}
                      onChange={(e) =>
                        setEvent({ ...event, event_description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover_image_url">Cover Image URL</Label>
                    <Input
                      id="cover_image_url"
                      type="url"
                      value={event.cover_image_url || ""}
                      onChange={(e) =>
                        setEvent({ ...event, cover_image_url: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleBasicInfoUpdate}
                  disabled={saving}
                  className="w-full mt-4"
                >
                  {saving ? "Saving..." : "Save Basic Information"}
                </Button>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.event_schedule.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="space-y-4 border-b pb-4 last:border-0"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-2 flex-1">
                          <Label>Day Title</Label>
                          <Input
                            value={day.time}
                            onChange={(e) => {
                              const newSchedule = [...event.event_schedule];
                              newSchedule[dayIndex].time = e.target.value;
                              setEvent({ ...event, event_schedule: newSchedule });
                            }}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="ml-2"
                          onClick={() => {
                            const newSchedule = event.event_schedule.filter(
                              (_, i) => i !== dayIndex
                            );
                            setEvent({ ...event, event_schedule: newSchedule });
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>

                      {day.events.map((scheduleEvent, eventIndex) => (
                        <div
                          key={eventIndex}
                          className="grid grid-cols-[1fr_1fr_auto] gap-4"
                        >
                          <div className="space-y-2">
                            <Label>Event Name</Label>
                            <Input
                              value={scheduleEvent.name}
                              onChange={(e) => {
                                const newSchedule = [...event.event_schedule];
                                newSchedule[dayIndex].events[eventIndex].name =
                                  e.target.value;
                                setEvent({
                                  ...event,
                                  event_schedule: newSchedule,
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Time</Label>
                            <Input
                              value={scheduleEvent.time}
                              onChange={(e) => {
                                const newSchedule = [...event.event_schedule];
                                newSchedule[dayIndex].events[eventIndex].time =
                                  e.target.value;
                                setEvent({
                                  ...event,
                                  event_schedule: newSchedule,
                                });
                              }}
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="self-end"
                            onClick={() => {
                              const newSchedule = [...event.event_schedule];
                              newSchedule[dayIndex].events = newSchedule[
                                dayIndex
                              ].events.filter((_, i) => i !== eventIndex);
                              setEvent({ ...event, event_schedule: newSchedule });
                            }}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        onClick={() => {
                          const newSchedule = [...event.event_schedule];
                          newSchedule[dayIndex].events.push({
                            name: "",
                            time: "",
                          });
                          setEvent({ ...event, event_schedule: newSchedule });
                        }}
                      >
                        Add Event
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setEvent({
                        ...event,
                        event_schedule: [
                          ...event.event_schedule,
                          { time: "", events: [{ name: "", time: "" }] },
                        ],
                      });
                    }}
                  >
                    Add Day
                  </Button>

                  <Button
                    onClick={handleScheduleUpdate}
                    disabled={saving}
                    className="w-full mt-4"
                  >
                    {saving ? "Saving..." : "Save Schedule"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {event.event_resources.map((resource, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_1fr_auto] gap-4 border-b pb-4 last:border-0"
                    >
                      <div className="space-y-2">
                        <Label>Resource Name</Label>
                        <Input
                          value={resource.name}
                          onChange={(e) => {
                            const newResources = [...event.event_resources];
                            newResources[index].name = e.target.value;
                            setEvent({ ...event, event_resources: newResources });
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link</Label>
                        <Input
                          type="url"
                          value={resource.link}
                          onChange={(e) => {
                            const newResources = [...event.event_resources];
                            newResources[index].link = e.target.value;
                            setEvent({ ...event, event_resources: newResources });
                          }}
                        />
                      </div>

                      <Button
                        variant="destructive"
                        size="icon"
                        className="self-end"
                        onClick={() => {
                          const newResources = event.event_resources.filter(
                            (_, i) => i !== index
                          );
                          setEvent({ ...event, event_resources: newResources });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setEvent({
                        ...event,
                        event_resources: [
                          ...event.event_resources,
                          { name: "", link: "" },
                        ],
                      });
                    }}
                  >
                    Add Resource
                  </Button>

                  <Button
                    onClick={handleResourcesUpdate}
                    disabled={saving}
                    className="w-full mt-4"
                  >
                    {saving ? "Saving..." : "Save Resources"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="prizes">
          <Card>
            <CardHeader>
              <CardTitle>Track Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {event.event_tracks && event.event_tracks.length > 0 ? (
                  event.event_tracks.map((track) => (
                    <div key={track.track_id} className="border p-4 rounded-lg">
                      <h3 className="text-lg font-bold mb-2">{track.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">{track.description}</p>
                      
                      <div className="space-y-4">
                        {track.prizes && track.prizes.map((prize, prizeIndex) => (
                          <div key={prize.id || prizeIndex} className="grid grid-cols-[1fr_2fr_auto] gap-4 items-start">
                            <div className="space-y-2">
                              <Label>Prize Amount</Label>
                              <Input
                                value={prize.prize_amount}
                                onChange={(e) => {
                                  const newTracks = [...event.event_tracks!];
                                  const trackIndex = newTracks.findIndex(t => t.track_id === track.track_id);
                                  if (trackIndex > -1 && newTracks[trackIndex].prizes) {
                                    newTracks[trackIndex].prizes![prizeIndex].prize_amount = e.target.value;
                                    setEvent({ ...event, event_tracks: newTracks });
                                  }
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Textarea
                                value={prize.prize_description}
                                onChange={(e) => {
                                  const newTracks = [...event.event_tracks!];
                                  const trackIndex = newTracks.findIndex(t => t.track_id === track.track_id);
                                  if (trackIndex > -1 && newTracks[trackIndex].prizes) {
                                    newTracks[trackIndex].prizes![prizeIndex].prize_description = e.target.value;
                                    setEvent({ ...event, event_tracks: newTracks });
                                  }
                                }}
                              />
                            </div>
                            
                            <Button
                              variant="destructive"
                              size="icon"
                              className="self-end mt-8"
                              onClick={async () => {
                                if (prize.id) {
                                  try {
                                    setSaving(true);
                                    const { error } = await supabase
                                      .from("prizes")
                                      .delete()
                                      .eq("id", prize.id);
                                    
                                    if (error) throw error;
                                    
                                    const newTracks = [...event.event_tracks!];
                                    const trackIndex = newTracks.findIndex(t => t.track_id === track.track_id);
                                    if (trackIndex > -1 && newTracks[trackIndex].prizes) {
                                      newTracks[trackIndex].prizes = newTracks[trackIndex].prizes!.filter(p => p.id !== prize.id);
                                      setEvent({ ...event, event_tracks: newTracks });
                                    }
                                    
                                    toast({
                                      title: "Prize deleted",
                                      description: "Prize has been removed successfully",
                                    });
                                  } catch (error) {
                                    console.error("Error deleting prize:", error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to delete prize",
                                      variant: "destructive",
                                    });
                                  } finally {
                                    setSaving(false);
                                  }
                                } else {
                                  // Just remove from local state if no ID (not saved to DB yet)
                                  const newTracks = [...event.event_tracks!];
                                  const trackIndex = newTracks.findIndex(t => t.track_id === track.track_id);
                                  if (trackIndex > -1 && newTracks[trackIndex].prizes) {
                                    newTracks[trackIndex].prizes = newTracks[trackIndex].prizes!.filter((_, i) => i !== prizeIndex);
                                    setEvent({ ...event, event_tracks: newTracks });
                                  }
                                }
                              }}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            const newTracks = [...event.event_tracks!];
                            const trackIndex = newTracks.findIndex(t => t.track_id === track.track_id);
                            if (trackIndex > -1) {
                              if (!newTracks[trackIndex].prizes) {
                                newTracks[trackIndex].prizes = [];
                              }
                              newTracks[trackIndex].prizes!.push({
                                id: crypto.randomUUID(),
                                prize_amount: "",
                                prize_description: ""
                              });
                              setEvent({ ...event, event_tracks: newTracks });
                            }
                          }}
                        >
                          Add Prize to {track.name}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No tracks found. Please add tracks to manage prizes.</p>
                  </div>
                )}
                
                <Button
                  onClick={handlePrizesUpdate}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save All Prizes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.rules.map((rule, ruleIndex) => (
                  <div
                    key={ruleIndex}
                    className="space-y-4 border-b pb-4 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div className="space-y-2 flex-1">
                        <Label>Section Title</Label>
                        <Input
                          value={rule.title}
                          onChange={(e) => {
                            const newRules = [...event.rules];
                            newRules[ruleIndex].title = e.target.value;
                            setEvent({ ...event, rules: newRules });
                          }}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="ml-2"
                        onClick={() => {
                          const newRules = event.rules.filter(
                            (_, i) => i !== ruleIndex
                          );
                          setEvent({ ...event, rules: newRules });
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>

                    {rule.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="space-y-2 flex items-end gap-2"
                      >
                        <div className="flex-1">
                          <Label>Rule {itemIndex + 1}</Label>
                          <Input
                            value={item}
                            onChange={(e) => {
                              const newRules = [...event.rules];
                              newRules[ruleIndex].items[itemIndex] =
                                e.target.value;
                              setEvent({ ...event, rules: newRules });
                            }}
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => {
                            const newRules = [...event.rules];
                            newRules[ruleIndex].items = newRules[
                              ruleIndex
                            ].items.filter((_, i) => i !== itemIndex);
                            setEvent({ ...event, rules: newRules });
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => {
                        const newRules = [...event.rules];
                        newRules[ruleIndex].items.push("");
                        setEvent({ ...event, rules: newRules });
                      }}
                    >
                      Add Rule
                    </Button>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setEvent({
                      ...event,
                      rules: [...event.rules, { title: "", items: [""] }],
                    });
                  }}
                >
                  Add Rule Section
                </Button>

                <Button
                  onClick={handleRulesUpdate}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Rules"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passwords">
          <RolePasswordSettings eventId={eventId} />
        </TabsContent>

        <TabsContent value="tracks">
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
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Event Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Event Participants</h3>
                  <Button onClick={() => exportParticipants(eventId)}>
                    Export Participants
                  </Button>
                </div>
                <ParticipantsList eventId={eventId} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Project Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Project Submissions</h3>
                  <Button onClick={() => exportSubmissions(eventId)}>
                    Export Submissions
                  </Button>
                </div>
                <ProjectSubmissionsList eventId={eventId} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card>
            <CardHeader>
              <CardTitle>Live Scoring Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Live Scoring Dashboard
                  </h3>
                  <Button onClick={() => exportScores(eventId)}>
                    Export Scores
                  </Button>
                </div>
                <LiveScoresDashboard
                  eventId={eventId}
                  scoringConfig={event.scoring_config || { tracks: {}, defaultMin: 1, defaultMax: 10, defaultWeight: 1 }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
