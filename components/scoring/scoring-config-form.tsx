"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrashIcon,
  PlusIcon,
  AlertTriangle,
  CheckSquare,
  DollarSign,
} from "lucide-react";
import {
  EventScoringConfig,
  ScoringCriterion,
  JudgingMode,
  EventTrack,
} from "@/lib/types";
import { defaultCriteria } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { JudgingModeSelector } from "../dashboard/organizer/tracks/judging-mode-selector";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  tracks?: EventTrack[]; // Add tracks prop to get judging_mode info
  onJudgingModeUpdate?: (trackId: string, mode: JudgingMode) => void; // Add update handler
}

export function ScoringConfigForm({
  initialConfig,
  onSave,
  isSubmitting = false,
  tracks = [],
  onJudgingModeUpdate,
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

    // Remove properties not relevant for choice-based questions
    if (type === "multiplechoice" || type === "choice") {
      delete sanitized.min;
      delete sanitized.max;
      delete sanitized.likertScale;

      if (!sanitized.options || !Array.isArray(sanitized.options)) {
        sanitized.options = [""];
      }
    } else if (type === "numeric" || type === "scale" || type === "likert") {
      // Remove choice based properties for numeric questions
      delete sanitized.options;

      sanitized.min = sanitized.min ?? (type === "likert" ? 1 : config.defaultMin);

      if (type === "likert") {
        sanitized.max = sanitized.likertScale ?? sanitized.max ?? config.defaultMax;
      } else {
        sanitized.max = sanitized.max ?? config.defaultMax;
      }

      sanitized.weight = sanitized.weight ?? config.defaultWeight;

      if (type !== "likert") {
        delete sanitized.likertScale;
      }
    }

    return sanitized;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  // Update a track's criteria to match its judging mode
  const updateTrackCriteriaForMode = (trackId: string) => {
    const track = tracks.find((t) => t.track_id === trackId);
    if (!track) return;

    // If the track is in investment mode, ensure criteria are investment-focused
    if (track.judging_mode === JudgingMode.Investment) {
      // Create a deep copy of the track in config
      setConfig((prev) => {
        const updatedConfig = { ...prev };
        if (updatedConfig.tracks[trackId]) {
          // Only update if the criteria doesn't already have investment-type fields
          const hasInvestmentCriteria = updatedConfig.tracks[
            trackId
          ].criteria.some(
            (c) => c.id === "investor_decision" || c.type === "choice"
          );

          if (!hasInvestmentCriteria) {
            updatedConfig.tracks[trackId] = {
              ...updatedConfig.tracks[trackId],
              criteria: [
                {
                  id: "investor_decision",
                  name: "Investment Decision",
                  description: "Would you invest in this company?",
                  weight: 1,
                  type: "choice",
                  options: ["invest", "pass", "maybe"],
                  min: 0,
                  max: 1,
                },
                {
                  id: "interest_level",
                  name: "Interest Level",
                  description: "How interested are you in this company?",
                  weight: 1,
                  type: "scale",
                  min: 0,
                  max: 5,
                },
              ],
            };
          }
        }
        return updatedConfig;
      });
    }
  };

  // Check all tracks when the component mounts or tracks change
  useEffect(() => {
    tracks.forEach((track) => {
      if (track.track_id && config.tracks[track.track_id]) {
        updateTrackCriteriaForMode(track.track_id);
      }
    });
  }, [tracks]);

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
                    onChange={(e) => {
                      updateTrackName(trackId, e.target.value);
                    }}
                    placeholder="Enter track name"
                  />
                </div>

                {/* Show track judging mode badge if available */}
                {tracks.find((t) => t.track_id === trackId)?.judging_mode && (
                  <Badge
                    className={
                      tracks.find((t) => t.track_id === trackId)
                        ?.judging_mode === JudgingMode.Investment
                        ? "bg-green-100 text-green-800 hover:bg-green-200"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }
                  >
                    {tracks.find((t) => t.track_id === trackId)
                      ?.judging_mode === JudgingMode.Investment ? (
                      <>
                        <DollarSign className="h-3.5 w-3.5 mr-1" /> Investment
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-3.5 w-3.5 mr-1" /> Traditional
                      </>
                    )}
                  </Badge>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeTrack(trackId)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>

              {onJudgingModeUpdate && (
                <div className="py-3 border-t my-4">
                  <h3 className="text-sm font-medium mb-3">
                    Judging Interface
                  </h3>
                  {tracks.find((t) => t.track_id === trackId) ? (
                    <>
                      <JudgingModeSelector
                        trackId={trackId}
                        currentMode={
                          tracks.find((t) => t.track_id === trackId)
                            ?.judging_mode || JudgingMode.Traditional
                        }
                        onUpdate={(mode) => onJudgingModeUpdate(trackId, mode)}
                      />

                      {/* Show informational alert for investment tracks */}
                      {tracks.find((t) => t.track_id === trackId)
                        ?.judging_mode === JudgingMode.Investment && (
                        <Alert className="mt-4 bg-blue-50">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          <AlertTitle className="text-blue-700 text-sm">
                            Investment Mode Active
                          </AlertTitle>
                          <AlertDescription className="text-blue-600 text-xs">
                            This track uses the investment judging interface.
                            The scoring criteria below will be mapped to the
                            investment interface&apos;s features.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-muted-foreground">
                        Save the track first to configure judging mode
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                                type: value as
                                  | "numeric"
                                  | "choice"
                                  | "scale"
                                  | "multiplechoice"
                                  | "likert",
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
                              <SelectItem value="choice">Choice</SelectItem>
                              <SelectItem value="scale">Scale</SelectItem>
                              <SelectItem value="likert">Likert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Show different fields based on question type */}
                        {criterion.type === "multiplechoice" || criterion.type === "choice" ? (
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
