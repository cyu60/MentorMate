"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface DefaultScoringProps {
  projectId: string;
  eventId: string;
  judgeId: string;
  trackId: string;
}

export function DefaultScoring({
  projectId,
  eventId,
  judgeId,
  trackId,
}: DefaultScoringProps) {
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProject() {
      try {
        // Fetch project details
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);
      } catch (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error",
          description: "Failed to load project data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [projectId, toast]);

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

  // In a real implementation, this would show the actual scoring form with criteria
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{project.project_name}</h2>
      <p className="text-muted-foreground">
        Traditional scoring interface for hackathon judging would appear here.
      </p>
      <p className="text-sm text-gray-500">Track ID: {trackId}</p>
    </div>
  );
}
