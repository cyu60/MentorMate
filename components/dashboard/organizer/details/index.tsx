"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast as useToast } from "@/hooks/use-toast";
import { TrashIcon } from "lucide-react";
import { EventDetails } from "@/lib/types";

interface EventDetailsTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  router: ReturnType<typeof useRouter>;
  toast: typeof useToast;
}

interface UpdateEventData {
  event_name?: string;
  event_date?: string;
  location?: string;
  event_description?: string;
  event_blurb?: string;
  cover_image_url?: string;
  event_schedule?: EventDetails["event_schedule"];
  event_resources?: EventDetails["event_resources"];
}

export function EventDetailsTab({
  event,
  setEvent,
  saving,
  setSaving,
  router,
  toast,
}: EventDetailsTabProps) {
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(
    null
  );
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const handleBasicInfoUpdate = async () => {
    if (!event) return;

    try {
      setSaving(true);
      let coverImageUrl = event.cover_image_url;

      // Handle file upload if there's a new file selected
      if (selectedCoverImage) {
        const fileExt = selectedCoverImage.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `event-covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("event-materials")
          .upload(filePath, selectedCoverImage);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-materials").getPublicUrl(filePath);

        coverImageUrl = publicUrl;
      }

      // Update event with new cover image URL if it changed
      updateEvent({
        event_name: event.event_name,
        event_date: event.event_date,
        location: event.location,
        event_description: event.event_description,
        event_blurb: event.event_blurb,
        cover_image_url: coverImageUrl,
      });

      // Update local state
      setEvent({ ...event, cover_image_url: coverImageUrl });
      setSelectedCoverImage(null);
      setPreviewUrl(null);

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

  const handleScheduleUpdate = () => {
    if (!event) return;
    updateEvent({ event_schedule: event.event_schedule });
  };

  const handleResourcesUpdate = () => {
    if (!event) return;
    updateEvent({ event_resources: event.event_resources });
  };

  return (
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
                  setEvent({
                    ...event,
                    event_description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_blurb">Event Blurb</Label>
              <Textarea
                id="event_blurb"
                value={event.event_blurb || ""}
                onChange={(e) =>
                  setEvent({ ...event, event_blurb: e.target.value })
                }
                rows={2}
                placeholder="A short, catchy description of your event"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover_image">Cover Image</Label>
              <div className="flex items-center gap-2 mb-2">
                <Button
                  type="button"
                  variant={!useImageUrl ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseImageUrl(false)}
                >
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={useImageUrl ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseImageUrl(true)}
                >
                  Use URL
                </Button>
              </div>

              {!useImageUrl ? (
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="cover_image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedCoverImage(file);
                        // Create preview URL
                        const preview = URL.createObjectURL(file);
                        setPreviewUrl(preview);
                      }
                    }}
                    className="flex-1 text-base file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                  {(selectedCoverImage || event.cover_image_url) && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedCoverImage(null);
                        setPreviewUrl(null);
                        setEvent({ ...event, cover_image_url: "" });
                        const fileInput = document.getElementById(
                          "cover_image"
                        ) as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = "";
                        }
                      }}
                      className="px-2 py-1"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ) : (
                <Input
                  type="url"
                  value={event.cover_image_url || ""}
                  onChange={(e) => {
                    setEvent({
                      ...event,
                      cover_image_url: e.target.value,
                    });
                    setPreviewUrl(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {(previewUrl || event.cover_image_url) && (
                <div className="mt-2">
                  <img
                    width={400}
                    height={200}
                    src={previewUrl || event.cover_image_url || ""}
                    alt="Cover preview"
                    className="rounded-md object-cover"
                  />
                </div>
              )}
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
                        setEvent({
                          ...event,
                          event_schedule: newSchedule,
                        });
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
                      setEvent({
                        ...event,
                        event_resources: newResources,
                      });
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
                      setEvent({
                        ...event,
                        event_resources: newResources,
                      });
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
  );
}
