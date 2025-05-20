"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { ScoringCriterion, Project } from "@/lib/types";
import { QuestionFactory } from "./question-types/question-factory";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface DefaultScoringProps {
  projectId: string;
  eventId: string;
  judgeId: string;
  trackId: string;
}

interface FormValues {
  scores: Record<string, number | string>;
  comments: string;
}

export function DefaultScoring({
  projectId,
  eventId,
  judgeId,
  trackId,
}: DefaultScoringProps) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      scores: {},
      comments: "",
    },
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);

        // Fetch scoring criteria for this track
        const { data: trackData, error: trackError } = await supabase
          .from("event_tracks")
          .select("scoring_criteria")
          .eq("track_id", trackId)
          .single();

        if (trackError) throw trackError;

        if (trackData?.scoring_criteria?.criteria) {
          const typedCriteria = trackData.scoring_criteria.criteria.map(
            (criterion: ScoringCriterion) => ({
              ...criterion,
              type: criterion.type || "numeric",
            })
          );
          setCriteria(typedCriteria);

          // Initialize form with default values
          const defaultScores: Record<string, number | string> = {};
          typedCriteria.forEach((criterion: ScoringCriterion) => {
            if (criterion.type === "multiplechoice") {
              defaultScores[criterion.id] = "";
            } else {
              defaultScores[criterion.id] = criterion.min || 1;
            }
          });

          form.reset({ scores: defaultScores, comments: "" });
        }

        // Check if this project has already been scored by this judge
        const { data: existingScore, error: scoreError } = await supabase
          .from("project_scores")
          .select("scores, comments")
          .eq("project_id", projectId)
          .eq("track_id", trackId)
          .eq("judge_id", judgeId)
          .maybeSingle();

        if (!scoreError && existingScore) {
          // Pre-fill the form with existing scores
          form.reset({
            scores: existingScore.scores,
            comments: existingScore.comments || "",
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [projectId, trackId, judgeId, toast, form]);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);

    try {
      console.log(values);
      // Check if a score already exists
      const { data: existingScore, error: checkError } = await supabase
        .from("project_scores")
        .select("id")
        .eq("project_id", projectId)
        .eq("track_id", trackId)
        .eq("judge_id", judgeId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingScore) {
        // Update existing score
        const { error: updateError } = await supabase
          .from("project_scores")
          .update({
            scores: values.scores,
            comments: values.comments,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingScore.id);

        if (updateError) throw updateError;
      } else {
        // Insert new score
        const { error: insertError } = await supabase
          .from("project_scores")
          .insert({
            project_id: projectId,
            track_id: trackId,
            judge_id: judgeId,
            event_id: eventId,
            scores: values.scores,
            comments: values.comments,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Score submitted",
        description: "Your evaluation has been saved successfully.",
      });
    } catch (error) {
      console.error("Error submitting score:", error);
      toast({
        title: "Error",
        description: "Failed to save your evaluation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Project not found</p>
      </div>
    );
  }

  if (criteria.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-yellow-600">
          No scoring criteria defined for this track.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-xl font-bold">{project.project_name}</h2>
        <p className="text-gray-600">{project.project_description}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {criteria.map((criterion) => (
              <FormField
                key={criterion.id}
                control={form.control}
                name={`scores.${criterion.id}`}
                render={({ field }) => (
                  <QuestionFactory
                    criterion={criterion}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            ))}
          </div>

          <FormItem>
            <FormLabel>Comments</FormLabel>
            <Textarea
              placeholder="Add any additional feedback for this project..."
              {...form.register("comments")}
              className="min-h-32"
            />
          </FormItem>

          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
