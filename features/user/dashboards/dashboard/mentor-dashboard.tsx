import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface MentorDashboardProps {
  eventId: string;
}

export function MentorDashboard({ eventId }: MentorDashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [eventId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Mentor Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : projects.length === 0 ? (
              <p>No projects submitted yet.</p>
            ) : (
              <ul className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <li key={project.id} className="border-b pb-2">
                    <Link
                      href={`/projects/public/${project.id}`}
                      className="hover:text-blue-500"
                    >
                      <h3 className="font-semibold">{project.project_name}</h3>
                      <p className="text-sm text-gray-600">
                        {project.project_description}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Total Projects</h3>
                <p className="text-2xl">{projects.length}</p>
              </div>
              {/* Add more statistics here */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
