import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project, ScoringCriterion } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectScoringForm } from "@/components/scoring/project-scoring-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { defaultCriteria } from "@/lib/constants";

interface JudgeDashboardProps {
  eventId: string;
}

export function JudgeDashboard({ eventId }: JudgeDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(defaultCriteria);
  const [scoredProjects, setScoredProjects] = useState<Set<string>>(new Set());

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
        } else if (eventData?.scoring_config?.criteria) {
          setCriteria(eventData.scoring_config.criteria);
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
            .select("project_id")
            .eq("judge_id", session.user.id)
            .eq("event_id", eventId);

          if (scoresData) {
            setScoredProjects(
              new Set(scoresData.map((score) => score.project_id))
            );
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

  const handleScoreSubmitted = (projectId: string) => {
    setScoredProjects((prev) => new Set([...prev, projectId]));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const unScoredProjects = projects.filter(
    (project) => !scoredProjects.has(project.id)
  );
  const completedProjects = projects.filter((project) =>
    scoredProjects.has(project.id)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Judge Dashboard</h2>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            {unScoredProjects.length === 0 ? (
              <p>No projects pending review.</p>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {unScoredProjects.map((project) => (
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
                        criteria={criteria}
                        onScoreSubmitted={() =>
                          handleScoreSubmitted(project.id)
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
            {completedProjects.length === 0 ? (
              <p>No completed reviews yet.</p>
            ) : (
              <ul className="space-y-4">
                {completedProjects.map((project) => (
                  <li key={project.id} className="border-b pb-2">
                    <h3 className="font-semibold">{project.project_name}</h3>
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
    </div>
  );
}
