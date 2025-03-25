"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Edit, Calendar, List, Trophy, Book } from "lucide-react";
import { EventDetails, EventRole } from "@/lib/types";

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
}

export function OrganizerDashboard({ eventId }: { eventId: string }) {
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const router = useRouter();

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

        // Check if user is an organizer for this event
        const { data: roleData } = await supabase
          .from("user_event_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("event_id", eventId)
          .eq("role", EventRole.Organizer)
          .maybeSingle();

        if (!roleData) {
          toast.error("You don't have permission to edit this event");
          router.push("/organizer/dashboard");
          return;
        }

        const { data: eventData, error } = await supabase
          .from("events")
          .select("*")
          .eq("event_id", eventId)
          .single();

        if (error) throw error;
        setEvent(eventData);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [eventId, router]);

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

      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to save changes");
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

  const handlePrizesUpdate = () => {
    if (!event) return;
    updateEvent({ event_prizes: event.event_prizes });
  };

  const handleResourcesUpdate = () => {
    if (!event) return;
    updateEvent({ event_resources: event.event_resources });
  };

  const handleRulesUpdate = () => {
    if (!event) return;
    updateEvent({ rules: event.rules });
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
        <TabsList className="grid grid-cols-5 gap-4 mb-6">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="prizes" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Prizes
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
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

                <Button
                  onClick={handleBasicInfoUpdate}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Basic Information"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
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
                    <div className="space-y-2">
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

                    {day.events.map((scheduleEvent, eventIndex) => (
                      <div key={eventIndex} className="grid grid-cols-2 gap-4">
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
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Schedule"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prizes">
          <Card>
            <CardHeader>
              <CardTitle>Prizes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.event_prizes.map((prize, index) => (
                  <div
                    key={index}
                    className="space-y-4 border-b pb-4 last:border-0"
                  >
                    <div className="space-y-2">
                      <Label>Prize</Label>
                      <Input
                        value={prize.prize}
                        onChange={(e) => {
                          const newPrizes = [...event.event_prizes];
                          newPrizes[index].prize = e.target.value;
                          setEvent({ ...event, event_prizes: newPrizes });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Track</Label>
                      <Input
                        value={prize.track}
                        onChange={(e) => {
                          const newPrizes = [...event.event_prizes];
                          newPrizes[index].track = e.target.value;
                          setEvent({ ...event, event_prizes: newPrizes });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={prize.description}
                        onChange={(e) => {
                          const newPrizes = [...event.event_prizes];
                          newPrizes[index].description = e.target.value;
                          setEvent({ ...event, event_prizes: newPrizes });
                        }}
                      />
                    </div>
                  </div>
                ))}

                <Button
                  variant="outline"
                  onClick={() => {
                    setEvent({
                      ...event,
                      event_prizes: [
                        ...event.event_prizes,
                        { prize: "", track: "", description: "" },
                      ],
                    });
                  }}
                >
                  Add Prize
                </Button>

                <Button
                  onClick={handlePrizesUpdate}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Prizes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {event.event_resources.map((resource, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-4 border-b pb-4 last:border-0"
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
                  className="w-full"
                >
                  {saving ? "Saving..." : "Save Resources"}
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
                    <div className="space-y-2">
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

                    {rule.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="space-y-2">
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
      </Tabs>
    </div>
  );
}
