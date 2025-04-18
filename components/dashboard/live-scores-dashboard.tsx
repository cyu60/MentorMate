"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { EventScoringConfig, ScoringCriterion, EventTrack } from "@/lib/types";
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

interface LiveScoresDashboardProps {
  eventId: string;
  scoringConfig: EventScoringConfig;
}

export function LiveScoresDashboard({
  eventId,
  scoringConfig,
}: LiveScoresDashboardProps) {
  console.log('LiveScoresDashboard rendered with config:', scoringConfig);
  const [scores, setScores] = useState<DashboardProjectScore[]>([]);
  const [trackScores, setTrackScores] = useState<TrackScores>({});
  const [eventTracks, setEventTracks] = useState<EventTrack[]>([]);
  const [loading, setLoading] = useState(true);

  const calculateTrackScores = useCallback((scoreData: DashboardProjectScore[]) => {
    if (!scoreData.length) {
      console.log('No score data to calculate');
      setTrackScores({});
      return;
    }
    console.log('Calculating track scores with data:', scoreData);
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
        const trackConfig = scoringConfig.tracks[score.track_id] ||
          Object.values(scoringConfig.tracks).find(t => t.name === score.tracks?.name);
        
        if (!score.scores || Object.keys(score.scores).length === 0) {
          console.log(`No scores found for project ${score.project_id} in track ${score.track_id}`);
          return;
        }

        console.log(`Processing score for track ${score.track_id}:`, {
          trackConfig,
          trackInfo: score.tracks,
          scores: score.scores,
          scoringConfigTracks: Object.keys(scoringConfig.tracks)
        });

        // Calculate total score
        // If we have scoring config, use weighted calculation
        let totalScore = 0;
        if (trackConfig) {
          totalScore = Object.entries(score.scores).reduce((acc, [criterionId, scoreValue]) => {
            const criterion = trackConfig.criteria.find((c: ScoringCriterion) => c.id === criterionId);
            return acc + (scoreValue * (criterion?.weight || 1));
          }, 0);
        } else {
          // Otherwise use simple average
          totalScore = Object.values(score.scores).reduce((a, b) => a + b, 0);
        }
        projectScore.totalScore += totalScore;
        projectScore.numberOfJudges += 1;
        projectScore.averageScore = projectScore.totalScore / projectScore.numberOfJudges;
      });
  
      // Sort projects by average score within each track
      Object.keys(trackScoresMap).forEach((trackId) => {
        trackScoresMap[trackId].sort((a, b) => b.averageScore - a.averageScore);
      });

      console.log('Track scores calculated:', {
        trackScoresMap,
        trackIds: Object.keys(trackScoresMap),
        configTrackIds: Object.keys(scoringConfig.tracks),
        scores: scoreData.map(s => ({
          track_id: s.track_id,
          project_id: s.project_id,
          scores: s.scores
        }))
      });
  
      setTrackScores(trackScoresMap);
  }, [scoringConfig]);

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

        console.log('Fetched event tracks:', trackData);
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
          .order('track_id');

        if (error) {
          console.error("Error fetching scores:", error);
          throw error;
        }
        if (!data?.length) {
          console.log('No scores found for event:', eventId);
          setScores([]);
          return;
        }

        console.log('Fetched score data:', {
          data,
          eventId,
          trackIds: [...new Set(data.map(d => d.track_id))],
          projectIds: [...new Set(data.map(d => d.project_id))]
        });
        const typedData = (data || []).map(item => {
          const projectData = (item.projects as unknown) as {
            project_name: string;
            lead_name: string;
            event_id: string;
          };
          const trackData = (item.tracks as unknown) as {
            name: string;
          } | null;
          
          return {
            ...item,
            event_id: projectData?.event_id || eventId,
            projects: {
              project_name: projectData?.project_name || '',
              lead_name: projectData?.lead_name || '',
              event_id: projectData?.event_id || eventId
            },
            tracks: {
              name: trackData?.name || ''
            }
          };
        }) as DashboardProjectScore[];
        
        console.log('Processed score data:', typedData);
        if (typedData.length === 0) {
          console.log('No valid scores found after processing');
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
              .eq("project_id", (payload.new as { project_id: string }).project_id)
              .eq("projects.event_id", eventId)
              .order('track_id')
              .single();

            if (!error && data) {
              const projectData = (data.projects as unknown) as {
                project_name: string;
                lead_name: string;
                event_id: string;
              };
              const trackData = (data.tracks as unknown) as {
                name: string;
              } | null;
              
              const typedData = {
                ...data,
                event_id: projectData?.event_id || eventId,
                projects: {
                  project_name: projectData?.project_name || '',
                  lead_name: projectData?.lead_name || '',
                  event_id: projectData?.event_id || eventId
                },
                tracks: {
                  name: trackData?.name || ''
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
  }, [eventId, calculateTrackScores]);

  // Recalculate track scores whenever scores change
  useEffect(() => {
    calculateTrackScores(scores);
  }, [scores, calculateTrackScores]);

  if (loading) {
    return <div>Loading scores...</div>;
  }

  console.log('Rendering dashboard with tracks:', trackScores);
  console.log('Available scoring config tracks:', Object.keys(scoringConfig.tracks));

  if (Object.keys(trackScores).length === 0) {
    return <div>No scores available yet</div>;
  }

  return (
    <div className="space-y-6">
      {eventTracks.map((track) => (
        <Card key={track.track_id}>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              {track.name} {scoringConfig.tracks[track.track_id]?.name !== track.name && `(${scoringConfig.tracks[track.track_id]?.name})`}
            </h3>
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
                {(() => {
                  console.log(`Rendering track ${track.track_id} with scores:`, {
                    trackScores,
                    currentTrack: trackScores[track.track_id],
                    trackConfig: scoringConfig.tracks[track.track_id]
                  });
                  return trackScores[track.track_id]?.map((project, index) => (
                  <TableRow key={project.projectId}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{project.projectName}</TableCell>
                    <TableCell>{project.leadName}</TableCell>
                    <TableCell>{project.averageScore.toFixed(2)}</TableCell>
                    <TableCell>{project.numberOfJudges}</TableCell>
                  </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}