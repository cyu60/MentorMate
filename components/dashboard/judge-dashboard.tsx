import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project, EventTrack } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectScoringForm } from "@/components/scoring/project-scoring-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

interface JudgeDashboardProps {
  eventId: string;
}

interface ProjectScore {
  scores: Record<string, number>;
  comments: string;
}

export function JudgeDashboard({ eventId }: JudgeDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventTracks, setEventTracks] = useState<EventTrack[]>([]);
  const [scoredProjects, setScoredProjects] = useState<
    Map<string, Set<string>>
  >(new Map());
  const [projectScores, setProjectScores] = useState<Map<string, ProjectScore>>(
    new Map()
  );
  const [editingScore, setEditingScore] = useState<{
    projectId: string;
    trackId: string;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch event tracks
        const { data: trackData, error: trackError } = await supabase
          .from("event_tracks")
          .select(
            `
            *,
            track_id,
            name,
            description,
            scoring_criteria
          `
          )
          .eq("event_id", eventId);

        if (trackError) {
          console.error("Error fetching event tracks:", trackError);
          throw new Error(
            `Failed to fetch event tracks: ${trackError.message}`
          );
        }
        setEventTracks(trackData || []);

        // Fetch projects with their tracks
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select(
            `
            id,
            project_name,
            project_description,
            created_at,
            event_id,
            project_tracks!project_tracks_project_id_fkey!inner (
              track_id
            )
          `
          )
          .eq("event_id", eventId);

        if (projectsError) {
          console.error("Error fetching projects:", projectsError);
          throw new Error(`Failed to fetch projects: ${projectsError.message}`);
        }

        // Group projects by their IDs with all their tracks
        const projectMap = new Map<string, Project>();
        projectsData?.forEach(
          (project: {
            id: string;
            project_name: string;
            project_description: string;
            created_at: string;
            event_id: string;
            project_tracks: Array<{ track_id: string }>;
          }) => {
            const trackIds = project.project_tracks.map((pt) => pt.track_id);
            projectMap.set(project.id, {
              id: project.id,
              project_name: project.project_name,
              project_description: project.project_description,
              created_at: project.created_at,
              event_id: project.event_id,
              track_ids: trackIds,
              tracks: [],
              lead_name: "", // These fields are required by the Project type
              lead_email: "", // but not needed for the judge dashboard
              teammates: [],
            });
          }
        );

        setProjects(Array.from(projectMap.values()));

        // Fetch current user's scores
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error fetching session:", sessionError);
          throw new Error(`Failed to fetch session: ${sessionError.message}`);
        }

        if (session) {
          const { data: scoresData, error: scoresError } = await supabase
            .from("project_scores")
            .select(
              `
              project_id,
              track_id,
              scores,
              comments,
              projects!project_scores_project_id_fkey!inner (
                event_id
              )
            `
            )
            .eq("judge_id", session.user.id)
            .eq("projects.event_id", eventId);

          if (scoresError) {
            console.error("Error fetching scores:", scoresError);
            throw new Error(`Failed to fetch scores: ${scoresError.message}`);
          }

          if (scoresData) {
            // Create a map of project_id -> Set of scored track_ids
            const scoredMap = new Map<string, Set<string>>();
            const scoresMap = new Map<string, ProjectScore>();

            scoresData.forEach((score) => {
              if (!scoredMap.has(score.project_id)) {
                scoredMap.set(score.project_id, new Set());
              }
              scoredMap.get(score.project_id)?.add(score.track_id);

              // Store the actual scores
              const key = `${score.project_id}-${score.track_id}`;
              scoresMap.set(key, {
                scores: score.scores,
                comments: score.comments || "",
              });
            });

            setScoredProjects(scoredMap);
            setProjectScores(scoresMap);
          }
        }
      } catch (error) {
        console.error(
          "Error fetching data:",
          error instanceof Error ? error.message : error
        );
        // You might want to set an error state here to display to the user
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
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
    setEditingScore(null);
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

        const trackInfo = eventTracks.find((t) => t.track_id === trackId);
        if (!trackInfo) return null;

        const unScoredTrackProjects = trackProjects.filter(
          (project) => !scoredProjects.get(project.id)?.has(trackId)
        );
        const completedTrackProjects = trackProjects.filter((project) =>
          scoredProjects.get(project.id)?.has(trackId)
        );

        return (
          <div key={trackId} className="space-y-4">
            <h3 className="text-xl font-semibold">{trackInfo.name}</h3>
            <p className="text-gray-600">{trackInfo.description}</p>

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
                          {trackInfo.scoring_criteria ? (
                            <ProjectScoringForm
                              projectId={project.id}
                              trackId={trackId}
                              criteria={trackInfo.scoring_criteria.criteria}
                              onScoreSubmitted={() =>
                                handleScoreSubmitted(project.id, trackId)
                              }
                            />
                          ) : (
                            <p className="text-yellow-600">
                              Scoring criteria not configured for this track.
                            </p>
                          )}
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
                    {completedTrackProjects.map((project) => {
                      const scoreKey = `${project.id}-${trackId}`;
                      const projectScore = projectScores.get(scoreKey);
                      const isEditing =
                        editingScore?.projectId === project.id &&
                        editingScore?.trackId === trackId;

                      return (
                        <li key={project.id} className="border-b pb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">
                                {project.project_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {project.project_description}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              onClick={() =>
                                setEditingScore(
                                  isEditing
                                    ? null
                                    : { projectId: project.id, trackId }
                                )
                              }
                            >
                              {isEditing ? "Cancel Edit" : "Edit Score"}
                            </Button>
                          </div>

                          {isEditing && trackInfo.scoring_criteria ? (
                            <ProjectScoringForm
                              projectId={project.id}
                              trackId={trackId}
                              criteria={trackInfo.scoring_criteria.criteria}
                              onScoreSubmitted={() =>
                                handleScoreSubmitted(project.id, trackId)
                              }
                            />
                          ) : projectScore ? (
                            <div className="space-y-2 mt-2">
                              <div className="grid grid-cols-2 gap-4">
                                {Object.entries(projectScore.scores).map(
                                  ([criterionId, score]) => {
                                    const criterion =
                                      trackInfo.scoring_criteria?.criteria.find(
                                        (c) => c.id === criterionId
                                      );
                                    return (
                                      <div
                                        key={criterionId}
                                        className="text-sm"
                                      >
                                        <span className="font-medium">
                                          {criterion?.name}:{" "}
                                        </span>
                                        <span className="text-gray-600">
                                          {score}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                              {projectScore.comments && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">
                                    Comments:
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {projectScore.comments}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
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
