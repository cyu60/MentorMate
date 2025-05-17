"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, DollarSign, AlertCircle } from "lucide-react";
import { JudgingMode } from "@/lib/types";
import { defaultCriteria, defaultInvestmentCriteria } from "@/lib/constants";

interface JudgingModeSelectorProps {
  trackId: string;
  currentMode: JudgingMode;
  onUpdate: (mode: JudgingMode) => void;
  updateCriteria?: boolean;
}

export function JudgingModeSelector({
  trackId,
  currentMode = JudgingMode.Traditional,
  onUpdate,
  updateCriteria = true,
}: JudgingModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<JudgingMode>(currentMode);
  const [isSaving, setIsSaving] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const { toast } = useToast();

  const handleModeChange = async () => {
    try {
      setIsSaving(true);

      // Update the judging mode
      const { error } = await supabase
        .from("event_tracks")
        .update({ judging_mode: selectedMode })
        .eq("track_id", trackId);

      if (error) throw error;

      // If updateCriteria is enabled and mode is changing, update the criteria too
      if (updateCriteria && selectedMode !== currentMode) {
        // First get the current track data
        const { data: trackData, error: trackError } = await supabase
          .from("event_tracks")
          .select("*")
          .eq("track_id", trackId)
          .single();

        if (trackError) throw trackError;

        // Set criteria based on judging mode
        const newCriteria =
          selectedMode === JudgingMode.Investment
            ? defaultInvestmentCriteria
            : defaultCriteria;

        // Update the scoring criteria for this track
        const { error: updateError } = await supabase
          .from("event_tracks")
          .update({
            scoring_criteria: {
              name: trackData.name,
              criteria: newCriteria,
            },
          })
          .eq("track_id", trackId);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Judging mode and criteria updated successfully",
        });
      } else {
        toast({
          title: "Success",
          description: "Judging mode updated successfully",
        });
      }

      // Call the callback to update parent state
      onUpdate(selectedMode);
    } catch (error) {
      console.error("Error updating judging mode:", error);
      toast({
        title: "Error",
        description: "Failed to update judging mode",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
      setShowWarning(false);
    }
  };

  const handleModeSelect = (value: JudgingMode) => {
    setSelectedMode(value);
    // If changing from current mode and updateCriteria is enabled, show warning
    if (value !== currentMode && updateCriteria) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  };

  // Function to render additional judging modes in the future
  const renderJudgingModeOptions = () => {
    // Array of objects containing configuration for each judging mode
    const modeConfigs = [
      {
        value: JudgingMode.Traditional,
        id: "traditional",
        icon: <CheckSquare className="mr-2 h-4 w-4 text-blue-600" />,
        label: "Traditional Scoring",
        description: "Numerical scoring against multiple criteria (1-10 scale)",
      },
      {
        value: JudgingMode.Investment,
        id: "investment",
        icon: <DollarSign className="mr-2 h-4 w-4 text-green-600" />,
        label: "Investment Decision",
        description: "Binary invest/pass decision with interest level slider",
      },
      // New judging modes can be added here following the same pattern
    ];

    return modeConfigs.map((mode) => (
      <div
        key={mode.id}
        className="flex items-start space-x-2 rounded-md border p-3 hover:bg-accent"
      >
        <RadioGroupItem
          value={mode.value}
          id={`${trackId}-${mode.id}`}
          className="mt-1"
        />
        <div className="ml-2 space-y-1">
          <Label
            htmlFor={`${trackId}-${mode.id}`}
            className="flex items-center font-medium text-sm"
          >
            {mode.icon}
            {mode.label}
          </Label>
          <p className="text-xs text-muted-foreground">{mode.description}</p>
        </div>
      </div>
    ));
  };

  return (
    <div className="space-y-4">
      <RadioGroup
        value={selectedMode}
        onValueChange={(value) => handleModeSelect(value as JudgingMode)}
        className="space-y-2"
      >
        {renderJudgingModeOptions()}
      </RadioGroup>

      {showWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-700">Warning</p>
            <p className="text-yellow-600">
              {selectedMode === JudgingMode.Investment
                ? "Changing to investment mode will update the scoring criteria to use choice-based investment decisions and interest levels instead of traditional numerical scoring."
                : "Changing to traditional mode will replace the existing criteria with standard numerical scoring criteria (1-10 scale)."}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleModeChange}
          disabled={isSaving || selectedMode === currentMode}
          size="sm"
        >
          {isSaving ? "Saving..." : "Save Judging Mode"}
        </Button>
      </div>
    </div>
  );
}
