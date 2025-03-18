import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { fetchProjectById } from '@/lib/helpers/projects';

interface UseProjectResult {
  project: Project | null;
  isLoading: boolean;
  error: string | null;
}

export function useProject(projectId: string, includeEventName: boolean = false): UseProjectResult {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setIsLoading(false);
        setError('No project ID provided');
        return;
      }

      try {
        const projectData = await fetchProjectById(projectId, includeEventName);
        setProject(projectData);
      } catch (err) {
        setError('Failed to load project');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    loadProject();
  }, [projectId, includeEventName]);

  return { project, isLoading, error };
} 