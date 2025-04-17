"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EventScoringConfig } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectScore {
  project_id: string;
  track_id: string;
  scores: Record<string, number>;
  projects: {
    project_name: string;
    lead_name: string;
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

interface Winner {
  projectId: string;
  trackId: string;
  totalScore: number;
  rank: number;
}

interface LiveScoresDashboardProps {
  eventId: string;
  scoringConfig: EventScoringConfig;
  onWinnerSelected: (winners: Winner[]) => void;
}

export function LiveScoresDashboard({
  eventId,
  scoringConfig,
  onWinnerSelected,
}: LiveScoresDashboardProps) {
  const [scores, setScores] = useState<ProjectScore[]>([]);
  const [trackScores, setTrackScores] = useState<TrackScores>({});
  const [loading, setLoading] = useState(true);

  // Calculate average scores and rankings for each track
  const calculateTrackScores = (scoreData: ProjectScore[]) => {
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

      // Calculate total score for this submission
      const totalScore = Object.values(score.scores).reduce((a, b) => a + b, 0);
      projectScore.totalScore += totalScore;
      projectScore.numberOfJudges += 1;
      projectScore.averageScore = projectScore.totalScore / projectScore.numberOfJudges;
    });

    // Sort projects by average score within each track
    Object.keys(trackScoresMap).forEach((trackId) => {
      trackScoresMap[trackId].sort((a, b) => b.averageScore - a.averageScore);
    });

    setTrackScores(trackScoresMap);

    // Prepare winners data
    const winners = Object.entries(trackScoresMap).flatMap(([trackId, projects]) =>
      projects.slice(0, 3).map((project, index) => ({
        projectId: project.projectId,
        trackId,
        totalScore: project.averageScore,
        rank: index + 1,
      }))
    );

    onWinnerSelected(winners);
  };

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
            projects!project_scores_project_id_fkey (
              project_name,
              lead_name
            )
          `
          )
          .eq("event_id", eventId);

        if (error) throw error;
        const typedData = (data || []).map(item => ({
          ...item,
          projects: {
            project_name: item.projects?.[0]?.project_name || '',
            lead_name: item.projects?.[0]?.lead_name || ''
          }
        })) as ProjectScore[];
        
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
      .channel("project_scores_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_scores",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Fetch the updated score with project details
          if (payload.eventType === "DELETE") {
            setScores((current) =>
              current.filter((s) => s.project_id !== (payload.old as ProjectScore).project_id)
            );
          } else {
            const { data, error } = await supabase
              .from("project_scores")
              .select(
                `
                project_id,
                track_id,
                scores,
                projects!project_scores_project_id_fkey (
                  project_name,
                  lead_name
                )
              `
              )
              .eq("project_id", (payload.new as ProjectScore).project_id)
              .single();

            if (!error && data) {
              const typedData = {
                ...data,
                projects: {
                  project_name: data.projects?.[0]?.project_name || '',
                  lead_name: data.projects?.[0]?.lead_name || ''
                }
              } as ProjectScore;
              
              setScores((current) => {
                const newScores = current.filter(
                  (s) => s.project_id !== typedData.project_id
                );
                return [...newScores, typedData];
              });
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
  }, [scores]);

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