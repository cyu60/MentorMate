import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Checkbox } from "@/components/ui/checkbox"; // Using native input instead
import { EventTrack } from "@/lib/types";
import { Check, X, Edit2, Tag } from "lucide-react";
import { 
  fetchEventTracks, 
  fetchProjectTracks, 
  updateProjectTracks 
} from "@/features/projects/client-actions/track-update";
import { toast } from "@/lib/hooks/use-toast";

interface TrackSelectorProps {
  projectId: string;
  eventId: string;
  canEdit?: boolean;
  isLoading?: boolean;
}

export function TrackSelector({
  projectId,
  eventId,
  canEdit = false,
  isLoading = false,
}: TrackSelectorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<EventTrack[]>([]);
  const [currentTracks, setCurrentTracks] = useState<EventTrack[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);

  useEffect(() => {
    loadTracks();
  }, [projectId, eventId]);

  const loadTracks = async () => {
    setLoadingTracks(true);
    try {
      // Load available tracks for the event
      const { data: eventTracks, error: eventError } = await fetchEventTracks(eventId);
      if (eventError) {
        console.error("Error fetching event tracks:", eventError);
        toast({
          title: "Error",
          description: "Failed to load available tracks",
          variant: "destructive",
        });
        return;
      }

      // Load current project tracks
      const { data: projectTracks, error: projectError } = await fetchProjectTracks(projectId);
      if (projectError) {
        console.error("Error fetching project tracks:", projectError);
        toast({
          title: "Error",
          description: "Failed to load project tracks",
          variant: "destructive",
        });
        return;
      }

      setAvailableTracks(eventTracks || []);
      setCurrentTracks(projectTracks || []);
      setSelectedTrackIds(projectTracks?.map(track => track.track_id) || []);
    } catch (error) {
      console.error("Error loading tracks:", error);
      toast({
        title: "Error",
        description: "Failed to load tracks",
        variant: "destructive",
      });
    } finally {
      setLoadingTracks(false);
    }
  };

  const handleEdit = () => {
    if (!canEdit || isLoading) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { success, error } = await updateProjectTracks(projectId, selectedTrackIds);
      
      if (!success || error) {
        console.error("Error updating tracks:", error);
        toast({
          title: "Error",
          description: "Failed to update project tracks",
          variant: "destructive",
        });
        return;
      }

      // Reload tracks to get updated data
      await loadTracks();
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Project tracks updated successfully",
      });
    } catch (error) {
      console.error("Error updating tracks:", error);
      toast({
        title: "Error",
        description: "Failed to update project tracks",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedTrackIds(currentTracks.map(track => track.track_id));
  };

  const handleTrackToggle = (trackId: string, checked: boolean) => {
    if (checked) {
      setSelectedTrackIds(prev => [...prev, trackId]);
    } else {
      setSelectedTrackIds(prev => prev.filter(id => id !== trackId));
    }
  };

  if (loadingTracks) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Project Tracks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">Loading tracks...</div>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Edit Project Tracks
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select the tracks this project should compete in.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-3">
              {availableTracks.map((track) => (
                <div key={track.track_id} className="flex items-start gap-4 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    id={track.track_id}
                    checked={selectedTrackIds.includes(track.track_id)}
                    onChange={(e) => 
                      handleTrackToggle(track.track_id, e.target.checked)
                    }
                    disabled={isSaving}
                    className="w-4 h-4 mt-1 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label 
                      htmlFor={track.track_id}
                      className="text-sm font-medium text-gray-900 cursor-pointer"
                    >
                      {track.name}
                    </label>
                    {track.description && (
                      <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                    )}
                    {track.prizes && track.prizes.length > 0 && (
                      <div className="mt-2">
                        {track.prizes.map((prize, index) => (
                          <Badge key={index} variant="outline" className="mr-1 text-xs">
                            {prize.prize_amount}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Project Tracks
          {canEdit && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="ml-auto"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {currentTracks.length === 0 ? (
          <div className="text-sm text-gray-600">
            No tracks selected for this project.
            {canEdit && (
              <Button
                variant="link"
                onClick={handleEdit}
                className="p-0 ml-1 h-auto text-blue-600"
              >
                Add tracks
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {currentTracks.map((track) => (
              <div key={track.track_id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{track.name}</h4>
                    {track.description && (
                      <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                    )}
                    {track.prizes && track.prizes.length > 0 && (
                      <div className="mt-2">
                        {track.prizes.map((prize, index) => (
                          <Badge key={index} variant="outline" className="mr-1 text-xs">
                            {prize.prize_amount}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 