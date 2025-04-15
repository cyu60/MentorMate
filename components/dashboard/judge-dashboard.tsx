import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project, EventScoringConfig } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectScoringForm } from "@/components/scoring/project-scoring-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface JudgeDashboardProps {
  eventId: string;
}

export function JudgeDashboard({ eventId }: JudgeDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scoringConfig, setScoringConfig] = useState<EventScoringConfig | null>(
    null
  );
  const [scoredProjects, setScoredProjects] = useState<
    Map<string, Set<string>>
  >(new Map());

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event scoring config
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("scoring_config")
          .eq("event_id", eventId)
          .single();

        if (eventError) {
          console.error("Error fetching event scoring config:", eventError);
        } else if (eventData?.scoring_config) {
          setScoringConfig(eventData.scoring_config);
        }

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("event_id", eventId);

        if (projectsError) throw projectsError;
        setProjects(projectsData || []);

        // Fetch current user's scores
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const { data: scoresData } = await supabase
            .from("project_scores")
            .select("project_id, track_id")
            .eq("judge_id", session.user.id)
            .eq("event_id", eventId);

          if (scoresData) {
            // Create a map of project_id -> Set of scored track_ids
            const scoredMap = new Map<string, Set<string>>();
            scoresData.forEach((score) => {
              if (!scoredMap.has(score.project_id)) {
                scoredMap.set(score.project_id, new Set());
              }
              scoredMap.get(score.project_id)?.add(score.track_id);
            });
            setScoredProjects(scoredMap);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handleScoreSubmitted = (projectId: string, trackId: string) => {
    setScoredProjects((prev) => {
      const newMap = new Map(prev);
      if (!newMap.has(projectId)) {
        newMap.set(projectId, new Set());
      }
      newMap.get(projectId)?.add(trackId);
      return newMap;
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Group projects by track, allowing projects to appear in multiple tracks
  const projectsByTrack = projects.reduce((acc, project) => {
    if (!project.track_ids || project.track_ids.length === 0) {
      // Handle unassigned projects
      if (!acc["unassigned"]) {
        acc["unassigned"] = [];
      }
      acc["unassigned"].push(project);
    } else {
      // Add project to each of its tracks
      project.track_ids.forEach((trackId) => {
        if (!acc[trackId]) {
          acc[trackId] = [];
        }
        acc[trackId].push(project);
      });
    }
    return acc;
  }, {} as Record<string, Project[]>);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Judge Dashboard</h2>

      {Object.entries(projectsByTrack).map(([trackId, trackProjects]) => {
        // Handle unassigned projects
        if (trackId === "unassigned") {
          return (
            <div key={trackId} className="space-y-4">
              <h3 className="text-xl font-semibold">Unassigned Projects</h3>
              <Card>
                <CardHeader>
                  <CardTitle>Projects Without Track</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    These projects need to be assigned to at least one track
                    before they can be scored.
                  </p>
                  <ul className="space-y-4">
                    {trackProjects.map((project) => (
                      <li key={project.id} className="border-b pb-2">
                        <h3 className="font-semibold">
                          {project.project_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.project_description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          );
        }

        const trackConfig = scoringConfig?.tracks[trackId];
        if (!trackConfig) return null;

        const unScoredTrackProjects = trackProjects.filter(
          (project) => !scoredProjects.get(project.id)?.has(trackId)
        );
        const completedTrackProjects = trackProjects.filter((project) =>
          scoredProjects.get(project.id)?.has(trackId)
        );

        return (
          <div key={trackId} className="space-y-4">
            <h3 className="text-xl font-semibold">{trackConfig.name}</h3>

            <Card>
              <CardHeader>
                <CardTitle>Projects Pending Review</CardTitle>
              </CardHeader>
              <CardContent>
                {unScoredTrackProjects.length === 0 ? (
                  <p>No projects pending review in this track.</p>
                ) : (
                  <Accordion type="single" collapsible className="space-y-4">
                    {unScoredTrackProjects.map((project) => (
                      <AccordionItem key={project.id} value={project.id}>
                        <AccordionTrigger className="text-left">
                          <div>
                            <h3 className="font-semibold">
                              {project.project_name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {project.project_description}
                            </p>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ProjectScoringForm
                            projectId={project.id}
                            trackId={trackId}
                            criteria={trackConfig.criteria}
                            onScoreSubmitted={() =>
                              handleScoreSubmitted(project.id, trackId)
                            }
                          />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                {completedTrackProjects.length === 0 ? (
                  <p>No completed reviews in this track yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {completedTrackProjects.map((project) => (
                      <li key={project.id} className="border-b pb-2">
                        <h3 className="font-semibold">
                          {project.project_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {project.project_description}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
