"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrashIcon,
  PlusIcon,
} from "lucide-react";
import {
  EventScoringConfig,
  ScoringCriterion,
  EventTrack,
} from "@/lib/types";
import { defaultCriteria } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScoringConfigFormProps {
  initialConfig?: EventScoringConfig | null;
  onSave: (config: EventScoringConfig) => void;
  isSubmitting?: boolean;
  tracks?: EventTrack[]; 
}

export function ScoringConfigForm({
  initialConfig,
  onSave,
  isSubmitting = false,
  tracks = [],
}: ScoringConfigFormProps) {
  const [config, setConfig] = useState<EventScoringConfig>(
    initialConfig || {
      tracks: {},
      defaultMin: 1,
      defaultMax: 10,
      defaultWeight: 1,
    }
  );

  const { toast } = useToast();

  const addTrack = () => {
    const trackId = crypto.randomUUID();
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

  const removeTrack = async (trackId: string) => {
    const { error } = await supabase
      .from("event_tracks")
      .delete()
      .eq("track_id", trackId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete track",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Track deleted successfully",
      });
      setConfig((prev) => {
        const newTracks = { ...prev.tracks };
        delete newTracks[trackId];
        return { ...prev, tracks: newTracks };
      });
    }
  };

  const updateTrackName = (trackId: string, name: string) => {
    setConfig((prev) => ({
      ...prev,
      tracks: {
        ...prev.tracks,
        [trackId]: {
          ...prev.tracks[trackId],
          name: name,
        },
      },
    }));
  };

  const addCriterion = (trackId: string) => {
    setConfig((prev) => {
      // Create base criterion
      const baseId = `criterion_${prev.tracks[trackId].criteria.length + 1}`;
      const baseCriterion: ScoringCriterion = {
        id: baseId,
        name: "",
        description: "",
        type: "numeric",
        weight: prev.defaultWeight,
        min: prev.defaultMin,
        max: prev.defaultMax
      };
      
      // Sanitize based on criterion type
      const sanitizedCriterion = sanitizeCriterion(baseCriterion);
      
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackId]: {
            ...prev.tracks[trackId],
            criteria: [
              ...prev.tracks[trackId].criteria,
              sanitizedCriterion
            ],
          },
        },
      };
    });
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
    setConfig((prev) => {
      const currentCriterion = prev.tracks[trackId].criteria[criterionIndex];
      const updatedCriterion = { ...currentCriterion, ...updates };
      
      // Only sanitize when type changes or when specific properties need sanitization
      let finalCriterion = updatedCriterion;
      if (updates.type || updates.options !== undefined) {
        finalCriterion = sanitizeCriterion(updatedCriterion);
      }
      
      return {
        ...prev,
        tracks: {
          ...prev.tracks,
          [trackId]: {
            ...prev.tracks[trackId],
            criteria: prev.tracks[trackId].criteria.map((c, i) =>
              i === criterionIndex ? finalCriterion : c
            ),
          },
        },
      };
    });
  };
  
  // Function to sanitize criterion properties based on type
  const sanitizeCriterion = (criterion: ScoringCriterion): ScoringCriterion => {
    const { type } = criterion;
    const sanitized = { ...criterion };
    
    if (type === "multiplechoice") {
      // For choice-based criteria, remove numeric scoring properties
      delete sanitized.min;
      delete sanitized.max;
      
      // Ensure options array exists
      if (!sanitized.options || !Array.isArray(sanitized.options)) {
        sanitized.options = [""];
      }
    } else if (type === "numeric") {
      // For numeric criteria, remove choice properties
      delete sanitized.options;
      
      // Ensure numeric properties exist
      sanitized.min = sanitized.min ?? config.defaultMin;
      sanitized.max = sanitized.max ?? config.defaultMax;
      sanitized.weight = sanitized.weight ?? config.defaultWeight;
    }
    
    return sanitized;
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
          <Card key={trackId} className="p-4 border-2 border-blue-400">
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">
                    Track Name
                  </h3>
                  <Input
                    value={track.name}
                    onChange={(e) => {
                      updateTrackName(trackId, e.target.value);
                    }}
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

                        {/* Add question type selector */}
                        <div>
                          <label className="text-sm font-medium">
                            Question Type
                          </label>
                          <Select
                            value={criterion.type || "numeric"}
                            onValueChange={(value) =>
                              updateCriterion(trackId, index, {
                                type: value as "numeric" | "multiplechoice",
                              })
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select question type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="numeric">
                                Numeric Scale
                              </SelectItem>
                              <SelectItem value="multiplechoice">
                                Multiple Choice
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Show different fields based on question type */}
                        {criterion.type === "multiplechoice" ? (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              Options
                            </label>
                            <div className="space-y-2">
                              {criterion.options?.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [
                                        ...(criterion.options || []),
                                      ];
                                      newOptions[optionIndex] = e.target.value;
                                      updateCriterion(trackId, index, {
                                        options: newOptions,
                                      });
                                    }}
                                    placeholder="Enter option"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                      const newOptions =
                                        criterion.options?.filter(
                                          (_, i) => i !== optionIndex
                                        );
                                      updateCriterion(trackId, index, {
                                        options: newOptions,
                                      });
                                    }}
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOptions = [
                                    ...(criterion.options || []),
                                    "",
                                  ];
                                  updateCriterion(trackId, index, {
                                    options: newOptions,
                                  });
                                }}
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            </div>
                          </div>
                        ) : (
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
                                step={0.01}
                              />
                            </div>
                          </div>
                        )}
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
