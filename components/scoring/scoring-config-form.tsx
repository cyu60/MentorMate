"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { TrashIcon, PlusIcon } from "lucide-react";
import { EventScoringConfig, ScoringCriterion } from "@/lib/types";
import { defaultCriteria } from "@/lib/constants";

interface ScoringConfigFormProps {
  initialConfig?: EventScoringConfig;
  onSave: (config: EventScoringConfig) => void;
  isSubmitting?: boolean;
}

export function ScoringConfigForm({
  initialConfig,
  onSave,
  isSubmitting = false,
}: ScoringConfigFormProps) {
  const [config, setConfig] = useState<EventScoringConfig>(
    initialConfig || {
      tracks: {},
      defaultMin: 1,
      defaultMax: 10,
      defaultWeight: 1,
    }
  );

  const addTrack = () => {
    const trackId = `track_${Object.keys(config.tracks).length + 1}`;
    setConfig((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackId]: {
          name: "",
          criteria: [...defaultCriteria],
        },
      },
    }));
  };

  const removeTrack = (trackId: string) => {
    setConfig((prev) => {
      const newTracks = { ...prev.tracks };
      delete newTracks[trackId];
      return { ...prev, tracks: newTracks };
    });
  };

  const updateTrackName = (trackId: string, name: string) => {
    setConfig((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackId]: {
          ...prev.tracks[trackId],
          name,
        },
      },
    }));
  };

  const addCriterion = (trackId: string) => {
    setConfig((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackId]: {
          ...prev.tracks[trackId],
          criteria: [
            ...prev.tracks[trackId].criteria,
            {
              id: `criterion_${prev.tracks[trackId].criteria.length + 1}`,
              name: "",
              description: "",
              weight: config.defaultWeight,
              min: config.defaultMin,
              max: config.defaultMax,
            },
          ],
        },
      },
    }));
  };

  const removeCriterion = (trackId: string, criterionIndex: number) => {
    setConfig((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackId]: {
          ...prev.tracks[trackId],
          criteria: prev.tracks[trackId].criteria.filter(
            (_, i) => i !== criterionIndex
          ),
        },
      },
    }));
  };

  const updateCriterion = (
    trackId: string,
    criterionIndex: number,
    updates: Partial<ScoringCriterion>
  ) => {
    setConfig((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackId]: {
          ...prev.tracks[trackId],
          criteria: prev.tracks[trackId].criteria.map((c, i) =>
            i === criterionIndex ? { ...c, ...updates } : c
          ),
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium">Default Min Score</label>
            <Input
              type="number"
              value={config.defaultMin}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  defaultMin: parseInt(e.target.value),
                }))
              }
              min={0}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default Max Score</label>
            <Input
              type="number"
              value={config.defaultMax}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  defaultMax: parseInt(e.target.value),
                }))
              }
              min={1}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Default Weight</label>
            <Input
              type="number"
              value={config.defaultWeight}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  defaultWeight: parseFloat(e.target.value),
                }))
              }
              min={0}
              step={0.1}
            />
          </div>
        </div>

        {Object.entries(config.tracks).map(([trackId, track]) => (
          <Card key={trackId} className="p-4">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium">Track Name</label>
                  <Input
                    value={track.name}
                    onChange={(e) => updateTrackName(trackId, e.target.value)}
                    placeholder="Enter track name"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeTrack(trackId)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {track.criteria.map((criterion, index) => (
                  <div key={criterion.id} className="space-y-2 border-t pt-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-sm font-medium">
                            Criterion Name
                          </label>
                          <Input
                            value={criterion.name}
                            onChange={(e) =>
                              updateCriterion(trackId, index, {
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter criterion name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <Textarea
                            value={criterion.description}
                            onChange={(e) =>
                              updateCriterion(trackId, index, {
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter criterion description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Min Score
                            </label>
                            <Input
                              type="number"
                              value={criterion.min ?? config.defaultMin}
                              onChange={(e) =>
                                updateCriterion(trackId, index, {
                                  min: parseInt(e.target.value),
                                })
                              }
                              min={0}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Max Score
                            </label>
                            <Input
                              type="number"
                              value={criterion.max ?? config.defaultMax}
                              onChange={(e) =>
                                updateCriterion(trackId, index, {
                                  max: parseInt(e.target.value),
                                })
                              }
                              min={1}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">
                              Weight
                            </label>
                            <Input
                              type="number"
                              value={criterion.weight ?? config.defaultWeight}
                              onChange={(e) =>
                                updateCriterion(trackId, index, {
                                  weight: parseFloat(e.target.value),
                                })
                              }
                              min={0}
                              step={0.1}
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => removeCriterion(trackId, index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => addCriterion(trackId)}
                className="w-full"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Criterion
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          onClick={addTrack}
          className="w-full"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Track
        </Button>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving..." : "Save Scoring Configuration"}
        </Button>
      </div>
    </form>
  );
}
