"use client";

import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon } from "lucide-react";
import { EventDetails } from "@/lib/types";
import { toast as ToastType } from "@/hooks/use-toast";

interface ResourcesTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: typeof ToastType;
}

export function ResourcesTab({
  event,
  setEvent,
  saving,
  setSaving,
  toast,
}: ResourcesTabProps) {
  const handleResourcesUpdate = async () => {
    if (!event) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from("events")
        .update({ event_resources: event.event_resources })
        .eq("event_id", event.event_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Resources saved successfully",
      });
    } catch (error) {
      console.error("Error updating resources:", error);
      toast({
        title: "Error",
        description: "Failed to save resources",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
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
  );
} 