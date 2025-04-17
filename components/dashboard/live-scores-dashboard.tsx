"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { EventScoringConfig, ScoringCriterion } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardProjectScore {
  project_id: string;
  track_id: string;
  event_id: string;
  scores: Record<string, number>;
  projects: {
    project_name: string;
    lead_name: string;
    event_id: string;
  };
}

interface TrackScore {
  projectId: string;
  projectName: string;
  leadName: string;
  averageScore: number;
  totalScore: number;
  numberOfJudges: number;
}

interface TrackScores {
  [trackId: string]: TrackScore[];
}

interface LiveScoresDashboardProps {
  eventId: string;
  scoringConfig: EventScoringConfig;
}

export function LiveScoresDashboard({
  eventId,
  scoringConfig,
}: LiveScoresDashboardProps) {
  const [scores, setScores] = useState<DashboardProjectScore[]>([]);
  const [trackScores, setTrackScores] = useState<TrackScores>({});
  const [loading, setLoading] = useState(true);

  const calculateTrackScores = useCallback((scoreData: DashboardProjectScore[]) => {
      const trackScoresMap: TrackScores = {};
  
      // Group scores by track and project
      scoreData.forEach((score) => {
        if (!trackScoresMap[score.track_id]) {
          trackScoresMap[score.track_id] = [];
        }
  
        // Find existing project in track or create new entry
        let projectScore = trackScoresMap[score.track_id].find(
          (p) => p.projectId === score.project_id
        );
  
        if (!projectScore) {
          projectScore = {
            projectId: score.project_id,
            projectName: score.projects.project_name,
            leadName: score.projects.lead_name,
            averageScore: 0,
            totalScore: 0,
            numberOfJudges: 0,
          };
          trackScoresMap[score.track_id].push(projectScore);
        }
  
        // Calculate weighted total score for this submission
        const trackConfig = scoringConfig.tracks[score.track_id];
        if (trackConfig) {
          const totalScore = Object.entries(score.scores).reduce((acc, [criterionId, scoreValue]) => {
            const criterion = trackConfig.criteria.find((c: ScoringCriterion) => c.id === criterionId);
            return acc + (scoreValue * (criterion?.weight || 1));
          }, 0);
          projectScore.totalScore += totalScore;
          projectScore.numberOfJudges += 1;
          projectScore.averageScore = projectScore.totalScore / projectScore.numberOfJudges;
        }
      });
  
      // Sort projects by average score within each track
      Object.keys(trackScoresMap).forEach((trackId) => {
        trackScoresMap[trackId].sort((a, b) => b.averageScore - a.averageScore);
      });
  
      setTrackScores(trackScoresMap);
  }, [scoringConfig]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const { data, error } = await supabase
          .from("project_scores")
          .select(
            `
            project_id,
            track_id,
            scores,
            projects!project_scores_project_id_fkey!inner (
              project_name,
              lead_name,
              event_id
            )
          `
          )
          .eq("projects.event_id", eventId);

        if (error) throw error;
        const typedData = (data || []).map(item => {
          const projectsArray = item.projects as any[];
          const projectData = projectsArray?.[0] || {
            project_name: '',
            lead_name: '',
            event_id: eventId
          };
          
          return {
            ...item,
            event_id: projectData.event_id || eventId,
            projects: {
              project_name: projectData.project_name || '',
              lead_name: projectData.lead_name || '',
              event_id: projectData.event_id || eventId
            }
          };
        }) as DashboardProjectScore[];
        
        setScores(typedData);
        calculateTrackScores(typedData);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchScores();

    // Subscribe to real-time score updates
    const subscription = supabase
      .channel(`project_scores_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_scores",
          filter: `projects.event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Fetch the updated score with project details
          if (payload.eventType === "DELETE") {
            const oldScore = payload.old as { project_id: string };
            setScores((current) =>
              current.filter((s) => s.project_id !== oldScore.project_id)
            );
          } else {
            const { data, error } = await supabase
              .from("project_scores")
              .select(
                `
                project_id,
                track_id,
                scores,
                projects!project_scores_project_id_fkey!inner (
                  project_name,
                  lead_name,
                  event_id
                )
              `
              )
              .eq("project_id", (payload.new as { project_id: string }).project_id)
              .eq("projects.event_id", eventId)
              .single();

            if (!error && data) {
              const projectsArray = data.projects as any[];
              const projectData = projectsArray?.[0] || {
                project_name: '',
                lead_name: '',
                event_id: eventId
              };
              
              const typedData = {
                ...data,
                event_id: projectData.event_id || eventId,
                projects: {
                  project_name: projectData.project_name || '',
                  lead_name: projectData.lead_name || '',
                  event_id: projectData.event_id || eventId
                }
              } as DashboardProjectScore;
              
              // Verify the score is for the correct event
              if (typedData.projects.event_id === eventId) {
                setScores((current) => {
                  const newScores = current.filter(
                    (s) => s.project_id !== typedData.project_id
                  );
                  return [...newScores, typedData];
                });
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId]);

  // Recalculate track scores whenever scores change
  useEffect(() => {
    calculateTrackScores(scores);
  }, [scores, scoringConfig, calculateTrackScores]);

  if (loading) {
    return <div>Loading scores...</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(scoringConfig.tracks).map(([trackId, track]) => (
        <Card key={trackId}>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">{track.name}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Average Score</TableHead>
                  <TableHead># of Judges</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trackScores[trackId]?.map((project, index) => (
                  <TableRow key={project.projectId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{project.projectName}</TableCell>
                    <TableCell>{project.leadName}</TableCell>
                    <TableCell>{project.averageScore.toFixed(2)}</TableCell>
                    <TableCell>{project.numberOfJudges}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}