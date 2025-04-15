"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreFormData, ScoringCriterion } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface ProjectScoringFormProps {
  projectId: string;
  trackId: string;
  criteria: ScoringCriterion[];
  existingScore?: ScoreFormData;
  onScoreSubmitted: () => void;
  defaultMin?: number;
  defaultMax?: number;
}

export function ProjectScoringForm({
  projectId,
  trackId,
  criteria,
  existingScore,
  onScoreSubmitted,
  defaultMin = 1,
  defaultMax = 10,
}: ProjectScoringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ScoreFormData>(() => {
    if (existingScore) return existingScore;

    // Initialize scores with default values
    const initialScores: Record<string, number> = {};
    criteria.forEach((criterion) => {
      initialScores[criterion.id] = Math.floor(
        ((criterion.max ?? defaultMax) + (criterion.min ?? defaultMin)) / 2
      );
    });

    return {
      scores: initialScores,
      comments: "",
    };
  });

  const handleScoreChange = (criterionId: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [criterionId]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to submit scores",
          variant: "destructive",
        });
        return;
      }

      // First verify the project exists and has this track
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("track_ids")
        .eq("id", projectId)
        .single();

      if (projectError || !projectData) {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        return;
      }

      if (!projectData.track_ids.includes(trackId)) {
        toast({
          title: "Error",
          description: "Project is not assigned to this track",
          variant: "destructive",
        });
        return;
      }

      // Submit the score
      const { error } = await supabase.from("project_scores").upsert(
        {
          project_id: projectId,
          judge_id: session.user.id,
          track_id: trackId,
          scores: formData.scores,
          comments: formData.comments,
        },
        {
          onConflict: "project_id,judge_id,track_id",
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Project score submitted successfully",
      });

      onScoreSubmitted();
    } catch (error) {
      console.error("Error submitting score:", error);
      toast({
        title: "Error",
        description: "Failed to submit score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {criteria.map((criterion) => (
        <div key={criterion.id} className="space-y-2">
          <div className="flex justify-between items-baseline">
            <label className="text-sm font-medium">
              {criterion.name}
              {criterion.weight && (
                <span className="text-gray-500 ml-2">
                  (Weight: {criterion.weight * 100}%)
                </span>
              )}
            </label>
            <span className="text-sm text-gray-500">
              Score: {formData.scores[criterion.id]}
            </span>
          </div>
          <p className="text-sm text-gray-600">{criterion.description}</p>
          <input
            type="range"
            min={criterion.min ?? defaultMin}
            max={criterion.max ?? defaultMax}
            value={formData.scores[criterion.id]}
            onChange={(e) =>
              handleScoreChange(criterion.id, parseInt(e.target.value))
            }
            className="w-full"
          />
        </div>
      ))}

      <div className="space-y-2">
        <label className="text-sm font-medium">Comments</label>
        <Textarea
          value={formData.comments}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comments: e.target.value }))
          }
          placeholder="Add any comments about your scoring decisions..."
          className="min-h-[100px]"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Score"}
      </Button>
    </form>
  );
}
