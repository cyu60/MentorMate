"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventScoringConfig, ScoringCriterion, EventTrack } from "@/lib/types";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  tracks: {
    name: string;
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

interface ScoresTabProps {
  eventId: string;
  scoringConfig: EventScoringConfig;
}

export function ScoresTab({ eventId, scoringConfig }: ScoresTabProps) {
  const [scores, setScores] = useState<DashboardProjectScore[]>([]);
  const [trackScores, setTrackScores] = useState<TrackScores>({});
  const [eventTracks, setEventTracks] = useState<EventTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const exportScores = async () => {
    const { data } = await supabase
      .from("project_scores")
      .select(
        `
        project_id,
        track_id,
        scores,
        comments,
        projects (
          project_name
        )
      `
      )
      .eq("event_id", eventId);

    if (data) {
      const csv = Papa.unparse(
        data?.map((score) => ({
          "Project Name": score.projects?.[0]?.project_name || "",
          Track: score.track_id || "",
          "Total Score": Object.values(score.scores || {}).reduce(
            (a: number, b: unknown) => a + (typeof b === "number" ? b : 0),
            0
          ),
          Comments: score.comments,
        }))
      );

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scores-${eventId}.csv`;
      a.click();
    }
  };

  const calculateTrackScores = useCallback(
    (scoreData: DashboardProjectScore[]) => {
      if (!scoreData.length) {
        setTrackScores({});
        return;
      }

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

        // Find track config either by track_id or by matching name
        const trackConfig =
          scoringConfig.tracks[score.track_id] ||
          Object.values(scoringConfig.tracks).find(
            (t) => t.name === score.tracks?.name
          );

        if (!score.scores || Object.keys(score.scores).length === 0) {
          return;
        }

        // Calculate total score
        // If we have scoring config, use weighted calculation
        let totalScore = 0;
        if (trackConfig) {
          totalScore = Object.entries(score.scores).reduce(
            (acc, [criterionId, scoreValue]) => {
              const criterion = trackConfig.criteria.find(
                (c: ScoringCriterion) => c.id === criterionId
              );
              return acc + scoreValue * (criterion?.weight || 1);
            },
            0
          );
        } else {
          // Otherwise use simple average
          totalScore = Object.values(score.scores).reduce((a, b) => a + b, 0);
        }
        projectScore.totalScore += totalScore;
        projectScore.numberOfJudges += 1;
        projectScore.averageScore =
          projectScore.totalScore / projectScore.numberOfJudges;
      });

      // Sort projects by average score within each track
      Object.keys(trackScoresMap).forEach((trackId) => {
        trackScoresMap[trackId].sort((a, b) => b.averageScore - a.averageScore);
      });

      setTrackScores(trackScoresMap);
    },
    [scoringConfig]
  );

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event tracks first
        const { data: trackData, error: trackError } = await supabase
          .from("event_tracks")
          .select("*")
          .eq("event_id", eventId);

        if (trackError) {
          console.error("Error fetching event tracks:", trackError);
          throw trackError;
        }

        setEventTracks(trackData || []);

        // Then fetch scores
        const { data, error } = await supabase
          .from("project_scores")
          .select(
            `
            project_id,
            track_id,
            scores,
            projects:projects!inner (
              project_name,
              lead_name,
              event_id
            ),
            tracks:event_tracks!inner (
              name,
              track_id
            )
          `
          )
          .eq("projects.event_id", eventId)
          .order("track_id");

        if (error) {
          console.error("Error fetching scores:", error);
          throw error;
        }

        if (!data?.length) {
          setScores([]);
          return;
        }

        const typedData = (data || []).map((item) => {
          const projectData = item.projects as unknown as {
            project_name: string;
            lead_name: string;
            event_id: string;
          };
          const trackData = item.tracks as unknown as {
            name: string;
          } | null;

          return {
            ...item,
            event_id: projectData?.event_id || eventId,
            projects: {
              project_name: projectData?.project_name || "",
              lead_name: projectData?.lead_name || "",
              event_id: projectData?.event_id || eventId,
            },
            tracks: {
              name: trackData?.name || "",
            },
          };
        }) as DashboardProjectScore[];

        if (typedData.length === 0) {
          setScores([]);
          setTrackScores({});
          return;
        }

        setScores(typedData);
        calculateTrackScores(typedData);
      } catch (error) {
        console.error("Error fetching scores:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Subscribe to real-time score updates
    const subscription = supabase
      .channel(`project_scores_${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_scores",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Just reload all the data on any change
          fetchData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [eventId, calculateTrackScores]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Scoring Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Live Scoring Dashboard</h3>
            <Button onClick={exportScores}>Export Scores</Button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading scores...</div>
          ) : (
            <div className="space-y-6">
              {Object.keys(trackScores).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No scores available yet.</p>
                </div>
              ) : (
                <>
                  {Object.entries(trackScores).map(([trackId, scores]) => {
                    // Find the corresponding track name
                    const trackName =
                      eventTracks.find((t) => t.track_id === trackId)?.name ||
                      Object.values(scoringConfig.tracks).find((t) =>
                        trackId.includes(t.name)
                      )?.name ||
                      trackId;
                    return (
                      <Card key={trackId} className="overflow-hidden">
                        <div className="bg-primary text-primary-foreground p-4">
                          <h3 className="text-lg font-medium">
                            {trackName} Track
                          </h3>
                        </div>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Rank</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Lead</TableHead>
                                <TableHead className="text-right">
                                  Average Score
                                </TableHead>
                                <TableHead className="text-right">
                                  Judges
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {scores.map((score, index) => (
                                <TableRow key={score.projectId}>
                                  <TableCell className="font-medium">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell>{score.projectName}</TableCell>
                                  <TableCell>{score.leadName}</TableCell>
                                  <TableCell className="text-right">
                                    {score.averageScore.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {score.numberOfJudges}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
