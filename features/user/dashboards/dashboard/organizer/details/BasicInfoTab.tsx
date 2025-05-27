"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { EventDetails } from "@/lib/types";
import { useRouter } from "next/navigation";
import { toast as ToastType } from "@/lib/hooks/use-toast";

interface BasicInfoTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: typeof ToastType;
  router: ReturnType<typeof useRouter>;
}

export function BasicInfoTab({
  event,
  setEvent,
  saving,
  setSaving,
  toast,
  router,
}: BasicInfoTabProps) {
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(
    null
  );
  const [useImageUrl, setUseImageUrl] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [updateSlug, setUpdateSlug] = useState(false);

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
      const { error } = await supabase
        .from("events")
        .update({
          event_name: event.event_name,
          slug: event.slug,
          event_date: event.event_date,
          location: event.location,
          event_description: event.event_description,
          event_blurb: event.event_blurb,
          cover_image_url: coverImageUrl,
        })
        .eq("event_id", event.event_id);

      if (error) throw error;

      // Update local state
      setEvent({ ...event, cover_image_url: coverImageUrl });
      setSelectedCoverImage(null);
      setPreviewUrl(null);

      // Refresh the page to update the overview
      router.refresh();

      if (updateSlug) {
        setUpdateSlug(false);
        router.push(`/events/${event.slug}/dashboard`);
      }

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

  return (
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
        <Label htmlFor="slug">URL Slug</Label>
        <Input
          id="slug"
          value={event.slug}
          onChange={(e) => {
            setEvent({ ...event, slug: e.target.value });
            setUpdateSlug(true);
          }}
          placeholder="url-friendly-event-name"
          className="font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          URL-friendly identifier for your event (lowercase, hyphens only)
        </p>
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
              src={previewUrl || event.cover_image_url || ""}
              alt="Cover preview"
              className="rounded-md object-cover w-[400px] h-[200px]"
            />
          </div>
        )}
      </div>

      <Button
        onClick={handleBasicInfoUpdate}
        disabled={saving}
        className="w-full mt-4"
      >
        {saving ? "Saving..." : "Save Basic Information"}
      </Button>
    </div>
  );
} 