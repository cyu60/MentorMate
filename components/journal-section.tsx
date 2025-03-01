"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useParams } from "next/navigation";
import { Pencil, X, Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

type SupabaseSessionResponse = {
  data: {
    session: Session | null;
  };
  error: Error | null;
} | null;

interface JournalEntry {
  id: string;
  user_id: string;
  event_id: string;
  type: "journal";
  content: string;
  display_name: string;
  created_at: string;
  is_private?: boolean;
  tags?: string[];
}

interface JournalSectionProps {
  eventId?: string;
}

export default function JournalSection({
  eventId: propEventId,
}: JournalSectionProps) {
  const params = useParams();
  const eventId = propEventId || (params.id as string);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [entry, setEntry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [sessionData, setSessionData] =
    useState<SupabaseSessionResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (eventId) {
      const initSession = async () => {
        const sessionResponse = await supabase.auth.getSession();
        setSessionData(sessionResponse);
        fetchEntries();
      };
      initSession();
    }
  }, [eventId]);

  const incrementPulse = async (userEmail: string) => {
    const { data: profiles, error: fetchError } = await supabase
      .from("user_profiles")
      .select("pulse")
      .eq("email", userEmail)
      .single();

    if (fetchError) {
      console.error("Error fetching pulse:", fetchError);
      return;
    }

    const currentPulse = profiles?.pulse || 0;
    const newPulse = currentPulse + 1;

    const { error: updateError } = await supabase
      .from("user_profiles")
      .update({ pulse: newPulse })
      .eq("email", userEmail);

    if (updateError) {
      console.error("Error updating pulse:", updateError);
      toast({
        title: "Error updating pulse",
        description: updateError.message || "Please try again later",
        variant: "destructive",
      });
    }
  };

  const fetchEntries = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) return;

    const { data, error } = await supabase
      .from("platform_engagement")
      .select("*")
      .eq("event_id", eventId)
      .eq("type", "journal")
      .eq("user_id", session.session.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching journal entries",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      setEntries(data);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmitEntry = async () => {
    if (!entry.trim()) return;

    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id || !session.session.user.email) {
      toast({
        title: "Authentication error",
        description: "Please sign in to create journal entries",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("platform_engagement").insert([
      {
        event_id: eventId,
        user_id: session.session.user.id,
        type: "journal",
        content: entry.trim(),
        display_name: session.session.user.user_metadata.full_name,
        is_private: isPrivate,
        tags: tags.length > 0 ? tags : undefined,
      },
    ]);

    if (error) {
      toast({
        title: "Error saving journal entry",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    await incrementPulse(session.session.user.email);

    setIsSubmitting(false);
    toast({
      title: "Journal entry saved",
      description: "Your entry has been saved successfully",
    });

    setEntry("");
    setIsPrivate(false);
    setTags([]);
    fetchEntries();
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setEditContent(entry.content);
    setIsPrivate(entry.is_private || false);
    setTags(entry.tags || []);
  };

  const handleUpdateEntry = async () => {
    if (!editContent.trim() || !editingId) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from("platform_engagement")
      .update({
        content: editContent.trim(),
        is_private: isPrivate,
        tags: tags.length > 0 ? tags : undefined,
      })
      .eq("id", editingId);

    if (error) {
      console.error("Error updating entry:", error);
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Journal entry updated",
      });
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === editingId
            ? {
                ...entry,
                content: editContent.trim(),
                is_private: isPrivate,
                tags: tags.length > 0 ? tags : undefined,
              }
            : entry
        )
      );
      setEditingId(null);
      setEditContent("");
      setIsPrivate(false);
      setTags([]);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">Journal</h2>
        <p className="mt-1 text-sm text-gray-500">
          Write down your thoughts, track your progress, and share insights with
          others.
        </p>
      </div>

      {/* Create / Edit Entry Section */}
      <div className="rounded-md bg-white p-6 shadow-sm">
        {editingId ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Edit Journal Entry</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setEditContent("");
                  setIsPrivate(false);
                  setTags([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-private"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="edit-private">Private</Label>
              </div>
              <Button
                onClick={handleUpdateEntry}
                disabled={isSubmitting}
                className="button-gradient text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea
              placeholder="Write your journal entry here..."
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              className="min-h-[150px] resize-none"
            />

            {/* Privacy Toggle */}
            <div className="flex items-center gap-2">
              <Switch
                id="private"
                checked={isPrivate}
                onCheckedChange={(checked: boolean) => setIsPrivate(checked)}
              />
              <Label htmlFor="private">Make private</Label>
            </div>

            {/* Tag Input */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTag}
                  className="bg-black text-white hover:bg-black/90"
                >
                  Add Tag
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Save Button */}
            <Button
              className="w-full bg-black text-white hover:bg-black/90"
              onClick={handleSubmitEntry}
              disabled={isSubmitting || !entry.trim()}
            >
              {isSubmitting ? "Saving..." : "Save Entry"}
            </Button>
          </div>
        )}
      </div>

      {/* Previous Entries Section */}
      {entries.length > 0 && (
        <div className="rounded-md bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Previous Entries</h3>
          <ul className="space-y-4">
            {entries.map((entry) => (
              <li key={entry.id} className="p-4 rounded-md border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{entry.display_name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons (Only for the Author) */}
                  {entry.user_id === sessionData?.data?.session?.user?.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <p className="whitespace-pre-wrap">{entry.content}</p>

                {entry.tags && entry.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
