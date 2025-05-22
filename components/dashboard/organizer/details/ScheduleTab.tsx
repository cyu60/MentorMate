"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon } from "lucide-react";
import { EventDetails } from "@/lib/types";
import { toast as ToastType } from "@/hooks/use-toast";

interface ScheduleTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: typeof ToastType;
}

export function ScheduleTab({
  event,
  setEvent,
  saving,
  setSaving,
  toast,
}: ScheduleTabProps) {
  const handleScheduleUpdate = async () => {
    if (!event) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("events")
        .update({ event_schedule: event.event_schedule })
        .eq("event_id", event.event_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Schedule saved successfully",
      });
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast({
        title: "Error",
        description: "Failed to save schedule",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
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
  );
} 