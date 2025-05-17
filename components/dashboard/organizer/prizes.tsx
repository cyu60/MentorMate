"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrashIcon } from "lucide-react";
import { EventDetails } from "@/lib/types";
import { supabase } from "@/lib/supabase";

interface PrizesTabProps {
  event: EventDetails;
  setEvent: React.Dispatch<React.SetStateAction<EventDetails | null>>;
  saving: boolean;
  setSaving: React.Dispatch<React.SetStateAction<boolean>>;
  toast: any;
}

export function PrizesTab({
  event,
  setEvent,
  saving,
  setSaving,
  toast,
}: PrizesTabProps) {
  const handlePrizesUpdate = async () => {
    if (!event || !event.event_tracks || event.event_tracks.length === 0)
      return;

    try {
      setSaving(true);

      // Process each track's prizes
      for (const track of event.event_tracks) {
        if (track.prizes && track.prizes.length > 0) {
          // Collect all prizes for this track for bulk upsert
          const trackPrizes = track.prizes.map((prize) => ({
            id: prize.id, // Will be used as match criteria for upsert
            track_id: track.track_id,
            prize_amount: prize.prize_amount,
            prize_description: prize.prize_description,
            updated_at: new Date().toISOString(),
          }));

          // Perform upsert operation
          const { error } = await supabase.from("prizes").upsert(trackPrizes, {
            onConflict: "id",
          });

          if (error) throw error;
        }
      }

      // Refresh the tracks data
      const { data: refreshedTracks } = await supabase
        .from("event_tracks")
        .select(
          `
          *,
          prizes (
            id,
            prize_amount,
            prize_description
          )
        `
        )
        .eq("event_id", event.event_id);

      if (refreshedTracks && event) {
        setEvent({
          ...event,
          event_tracks: refreshedTracks,
        });
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

  return (
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
                <p className="text-sm text-gray-500 mb-4">
                  {track.description}
                </p>

                <div className="space-y-4">
                  {track.prizes &&
                    track.prizes.map((prize, prizeIndex) => (
                      <div
                        key={prize.id || prizeIndex}
                        className="grid grid-cols-[1fr_2fr_auto] gap-4 items-start"
                      >
                        <div className="space-y-2">
                          <Label>Prize Amount</Label>
                          <Input
                            value={prize.prize_amount}
                            onChange={(e) => {
                              const newTracks = [...event.event_tracks!];
                              const trackIndex = newTracks.findIndex(
                                (t) => t.track_id === track.track_id
                              );
                              if (
                                trackIndex > -1 &&
                                newTracks[trackIndex].prizes
                              ) {
                                newTracks[trackIndex].prizes![
                                  prizeIndex
                                ].prize_amount = e.target.value;
                                setEvent({
                                  ...event,
                                  event_tracks: newTracks,
                                });
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
                              const trackIndex = newTracks.findIndex(
                                (t) => t.track_id === track.track_id
                              );
                              if (
                                trackIndex > -1 &&
                                newTracks[trackIndex].prizes
                              ) {
                                newTracks[trackIndex].prizes![
                                  prizeIndex
                                ].prize_description = e.target.value;
                                setEvent({
                                  ...event,
                                  event_tracks: newTracks,
                                });
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
                                const trackIndex = newTracks.findIndex(
                                  (t) => t.track_id === track.track_id
                                );
                                if (
                                  trackIndex > -1 &&
                                  newTracks[trackIndex].prizes
                                ) {
                                  newTracks[trackIndex].prizes = newTracks[
                                    trackIndex
                                  ].prizes!.filter((p) => p.id !== prize.id);
                                  setEvent({
                                    ...event,
                                    event_tracks: newTracks,
                                  });
                                }

                                toast({
                                  title: "Prize deleted",
                                  description:
                                    "Prize has been removed successfully",
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
                              const trackIndex = newTracks.findIndex(
                                (t) => t.track_id === track.track_id
                              );
                              if (
                                trackIndex > -1 &&
                                newTracks[trackIndex].prizes
                              ) {
                                newTracks[trackIndex].prizes = newTracks[
                                  trackIndex
                                ].prizes!.filter((_, i) => i !== prizeIndex);
                                setEvent({
                                  ...event,
                                  event_tracks: newTracks,
                                });
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
                      const trackIndex = newTracks.findIndex(
                        (t) => t.track_id === track.track_id
                      );
                      if (trackIndex > -1) {
                        if (!newTracks[trackIndex].prizes) {
                          newTracks[trackIndex].prizes = [];
                        }
                        newTracks[trackIndex].prizes!.push({
                          id: crypto.randomUUID(),
                          prize_amount: "",
                          prize_description: "",
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
              <p className="text-gray-600">
                No tracks found. Please add tracks to manage prizes.
              </p>
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
  );
}
