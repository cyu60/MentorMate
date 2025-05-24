"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreFormData, ScoringCriterion } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { toast } from "@/lib/hooks/use-toast";
import { PostgrestError } from "@supabase/supabase-js";
import VoiceInput from "@/components/utils/VoiceInput";

interface ProjectScoringFormProps {
  projectId: string;
  trackId: string;
  criteria: ScoringCriterion[];
  onScoreSubmitted: () => void;
  defaultMin?: number;
  defaultMax?: number;
}

interface ProjectData {
  projects: {
    id: string;
    event_id: string;
  };
}

export function ProjectScoringForm({
  projectId,
  trackId,
  criteria,
  onScoreSubmitted,
  defaultMin = 1,
  defaultMax = 10,
}: ProjectScoringFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ScoreFormData>(() => {
    // Initialize scores with default values
    const initialScores: Record<string, number | string> = {};
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

  useEffect(() => {
    // Reset form data when track changes
    const initialScores: Record<string, number | string> = {};
    criteria.forEach((criterion) => {
      initialScores[criterion.id] = Math.floor(
        ((criterion.max ?? defaultMax) + (criterion.min ?? defaultMin)) / 2
      );
    });
    setFormData({
      scores: initialScores,
      comments: "",
    });

    // Only fetch existing score if trackId is provided
    if (!trackId) {
      setIsLoading(false);
      return;
    }

    const fetchExistingScore = async () => {
      setIsLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          setIsLoading(false);
          return;
        }

        const { data: scoreData, error: scoreError } = await supabase
          .from("project_scores")
          .select("scores, comments")
          .eq("project_id", projectId)
          .eq("track_id", trackId)
          .eq("judge_id", session.user.id)
          .single();

        if (scoreError) {
          if (scoreError.code !== "PGRST116") {
            // Not Found error code
            console.error("Error fetching existing score:", scoreError);
            toast({
              title: "Error",
              description: "Failed to fetch existing score",
              variant: "destructive",
            });
          }
          return;
        }

        if (scoreData) {
          setFormData({
            scores: scoreData.scores,
            comments: scoreData.comments || "",
          });
        }
      } catch (error) {
        console.error("Error fetching score:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingScore();
  }, [projectId, trackId, criteria, defaultMax, defaultMin]);

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
      const { data: projectData, error: projectError } = (await supabase
        .from("project_tracks")
        .select(
          `
          projects!inner (
            id,
            event_id
          )
        `
        )
        .eq("project_id", projectId)
        .eq("track_id", trackId)
        .single()) as {
        data: ProjectData | null;
        error: PostgrestError | null;
      };

      if (projectError || !projectData?.projects?.event_id) {
        toast({
          title: "Error",
          description: "Project not found or not assigned to this track",
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
          event_id: projectData.projects.event_id,
          scores: formData.scores,
          comments: formData.comments,
          updated_at: new Date(),
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

  if (isLoading) {
    return <div>Loading existing scores...</div>;
  }

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

      <div className="space-y-2 px-2">
        <label className="text-sm font-medium">Comments</label>
        <Textarea
          value={formData.comments}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, comments: e.target.value }))
          }
          placeholder="Add any comments about your scoring decisions..."
          className="min-h-[100px]"
        />

        {/* Voice Input; editing the function to be compatible with setText typing; settext accepts a string or a function that returns a string */}
        <VoiceInput
          setText={(text: string | ((prevText: string) => string)) => {
            const newText =
              typeof text === "function" ? text(formData.comments || "") : text;
            setFormData((prev) => ({ ...prev, comments: newText }));
          }}
        />
      </div>

      <Button type="submit" disabled={isSubmitting || !trackId}>
        {isSubmitting ? "Submitting..." : "Submit Score"}
      </Button>
    </form>
  );
}
