"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Project,
  ProjectScore,
  EventRole,
  ScoringCriterion,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectScoringForm } from "@/components/scoring/project-scoring-form";
import { useEventRegistration } from "@/components/event-registration-provider";
import { redirect } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Default scoring criteria if none are configured for the event
const defaultCriteria: ScoringCriterion[] = [
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality of code, technical complexity, and implementation",
    weight: 1,
  },
  {
    id: "innovation",
    name: "Innovation",
    description: "Originality, creativity, and uniqueness of the solution",
    weight: 1,
  },
  {
    id: "impact",
    name: "Impact",
    description: "Potential impact and real-world applicability",
    weight: 1,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Quality of documentation, demo, and overall presentation",
    weight: 1,
  },
];

export default function JudgingPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { userRole } = useEventRegistration();
  const [projects, setProjects] = useState<Project[]>([]);
  const [scores, setScores] = useState<Record<string, ProjectScore>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(defaultCriteria);

  // Redirect if user is not a judge
  if (userRole !== EventRole.Judge && userRole !== EventRole.Admin) {
    redirect(`/events/${eventId}/overview`);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch event scoring config
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("scoring_config")
          .eq("id", eventId)
          .single();

        if (eventError) {
          console.error("Error fetching event scoring config:", eventError);
        } else if (eventData?.scoring_config?.criteria) {
          setCriteria(eventData.scoring_config.criteria);
        }

        // Fetch projects
        const { data: projectsData, error: projectsError } = await supabase
          .from("projects")
          .select("*")
          .eq("event_id", eventId);

        if (projectsError) throw projectsError;

        // Fetch current user's scores
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const { data: scoresData, error: scoresError } = await supabase
            .from("project_scores")
            .select("*")
            .eq("judge_id", session.user.id)
            .eq("event_id", eventId);

          if (scoresError) throw scoresError;

          // Convert scores array to record for easy lookup
          const scoresRecord: Record<string, ProjectScore> = {};
          scoresData?.forEach((score: ProjectScore) => {
            scoresRecord[score.project_id] = score;
          });

          setScores(scoresRecord);
        }

        setProjects(projectsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [eventId]);

  const handleScoreSubmitted = async () => {
    // Refresh scores after submission
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      const { data: scoresData } = await supabase
        .from("project_scores")
        .select("*")
        .eq("judge_id", session.user.id)
        .eq("event_id", eventId);

      const scoresRecord: Record<string, ProjectScore> = {};
      scoresData?.forEach((score: ProjectScore) => {
        scoresRecord[score.project_id] = score;
      });

      setScores(scoresRecord);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Judging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">
            Score each project based on the following criteria. Your scores will
            be used to determine the winners.
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Scoring Criteria</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{criterion.name}</h4>
                  <p className="text-sm text-gray-600">
                    {criterion.description}
                  </p>
                  {criterion.weight && criterion.weight !== 1 && (
                    <p className="text-sm text-blue-600 mt-1">
                      Weight: {criterion.weight}x
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {projects.map((project) => (
              <AccordionItem
                key={project.id}
                value={project.id}
                className="border rounded-lg p-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {project.project_name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        by {project.lead_name}
                      </p>
                    </div>
                    <div className="text-sm">
                      {scores[project.id] ? (
                        <span className="text-green-600">Scored</span>
                      ) : (
                        <span className="text-yellow-600">Not Scored</span>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 space-y-4">
                    <div className="prose max-w-none">
                      <h4 className="text-lg font-medium">Description</h4>
                      <p>{project.project_description}</p>
                      {project.project_url && (
                        <p>
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View Project
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="text-lg font-medium mb-4">Scoring</h4>
                      <ProjectScoringForm
                        projectId={project.id}
                        criteria={criteria}
                        existingScore={scores[project.id]}
                        onScoreSubmitted={handleScoreSubmitted}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
