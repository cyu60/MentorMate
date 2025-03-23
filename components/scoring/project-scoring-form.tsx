"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreFormData, ScoringCriterion } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface ProjectScoringFormProps {
  projectId: string;
  criteria: ScoringCriterion[];
  existingScore?: ScoreFormData;
  onScoreSubmitted: () => void;
  defaultMin?: number;
  defaultMax?: number;
}

export function ProjectScoringForm({
  projectId,
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
        (criterion.max ?? defaultMax) / 2
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

      const { data: projectData } = await supabase
        .from("projects")
        .select()
        .eq("id", projectId)
        .single();

      if (!projectData) {
        toast({
          title: "Error",
          description: "Project data not found",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("project_scores").upsert(
        {
          project_id: projectId,
          judge_id: session.user.id,
          scores: formData.scores,
          comments: formData.comments,
        },
        {
          onConflict: "project_id,judge_id",
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
      <div className="grid gap-6 md:grid-cols-2">
        {criteria.map((criterion) => (
          <div key={criterion.id} className="space-y-2">
            <label className="block text-sm font-medium">
              {criterion.name}
              <span className="block text-xs text-gray-500">
                {criterion.description}
              </span>
              {criterion.weight && (
                <span className="block text-xs text-blue-600">
                  Weight: {criterion.weight}x
                </span>
              )}
            </label>
            <div className="flex items-center space-x-2">
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
              <span className="text-sm font-medium w-8">
                {formData.scores[criterion.id]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Comments</label>
        <Textarea
          value={formData.comments || ""}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comments: e.target.value }))
          }
          placeholder="Add any comments or feedback about the project..."
          className="h-32"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-700 hover:bg-blue-800"
      >
        {isSubmitting ? "Submitting..." : "Submit Score"}
      </Button>
    </form>
  );
}
