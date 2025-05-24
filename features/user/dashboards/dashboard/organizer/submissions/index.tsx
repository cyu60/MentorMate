"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import Link from "next/link";

interface ProjectData {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  teammates: string[];
  project_url: string | null;
  additional_materials_url: string | null;
  cover_image_url: string | null;
  event_id: string;
  created_at: string;
  project_tracks: {
    event_tracks: {
      track_id: string;
      name: string;
    };
  }[];
}

interface SubmissionsTabProps {
  eventId: string;
}

export function SubmissionsTab({ eventId }: SubmissionsTabProps) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  const exportSubmissions = async () => {
    const { data } = await supabase
      .from("projects")
      .select(
        `
        project_name,
        lead_name,
        lead_email,
        project_description,
        project_url,
        teammates
      `
      )
      .eq("event_id", eventId);

    if (data) {
      const csv = Papa.unparse(
        data?.map((project) => ({
          "Project Name": project.project_name,
          "Lead Name": project.lead_name,
          "Lead Email": project.lead_email,
          Description: project.project_description,
          "Project URL": project.project_url,
          "Team Members": project.teammates.join(", "),
        }))
      );

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `submissions-${eventId}.csv`;
      a.click();
    }
  };

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(
            `
            id,
            project_name,
            lead_name,
            lead_email,
            project_description,
            project_url,
            teammates,
            created_at,
            project_tracks (
              event_tracks (
                track_id,
                name
              )
            )
          `
          )
          .eq("event_id", eventId)
          .overrideTypes<ProjectData[]>();

        if (error) throw error;
        setProjects((data as ProjectData[]) || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
    // Subscribe to real-time updates
    const subscription = supabase
      .channel("projects_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // Fetch the updated project with all related data
          if (payload.eventType === "DELETE") {
            setProjects((current) =>
              current.filter((p) => p.id !== payload.old.id)
            );
          } else {
            const { data, error } = await supabase
              .from("projects")
              .select(
                `
                id,
                project_name,
                lead_name,
                lead_email,
                project_description,
                project_url,
                teammates,
                created_at,
                project_tracks (
                  event_tracks (
                    track_id,
                    name
                  )
                )
              `
              )
              .eq("id", payload.new.id)
              .single()
              .overrideTypes<ProjectData>();

            if (!error && data) {
              setProjects((current) => {
                const newProjects = current.filter((p) => p.id !== data.id);
                return [...newProjects, data as ProjectData];
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Submissions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Project Submissions</h3>
            <Button onClick={exportSubmissions}>Export Submissions</Button>
          </div>

          {loading ? (
            <div>Loading projects...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Lead</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Tracks</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>{project.project_name}</TableCell>
                    <TableCell>{project.lead_name}</TableCell>
                    <TableCell>
                      {(project.teammates?.length || 0) + 1}
                    </TableCell>
                    <TableCell>
                      {project.project_tracks
                        ?.map((pt) => pt.event_tracks?.name)
                        .filter(Boolean)
                        .join(", ") || "No tracks"}
                    </TableCell>
                    <TableCell>
                      {new Date(project.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/public-project-details/${project.id}`}
                        passHref
                      >
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
