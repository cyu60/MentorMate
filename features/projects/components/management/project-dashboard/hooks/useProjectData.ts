import { useState, useEffect } from "react";
import { Project } from "@/lib/types";
import { fetchProjectById } from "@/features/projects/utils/projects";

export function useProjectData(projectId: string) {
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const project = await fetchProjectById(projectId);
        if (project) {
          setProjectData(project);
        } else {
          setError("Project not found");
        }
      } catch (err) {
        console.error("Error fetching project:", err);
        setError("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const refreshProject = async () => {
    try {
      const project = await fetchProjectById(projectId);
      if (project) {
        setProjectData(project);
      }
    } catch (err) {
      console.error("Error refreshing project:", err);
    }
  };

  return {
    projectData,
    setProjectData,
    isLoading,
    error,
    refreshProject,
  };
}