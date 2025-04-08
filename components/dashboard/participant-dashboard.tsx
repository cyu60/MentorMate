import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import dynamic from "next/dynamic";

const GoalSection = dynamic(() => import("@/components/journal/goal-section"), {
  ssr: false,
});

const JournalSection = dynamic(
  () => import("@/components/journal/journal-section"),
  {
    ssr: false,
  }
);

interface ParticipantDashboardProps {
  eventId: string;
}

export function ParticipantDashboard({ eventId }: ParticipantDashboardProps) {
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyProjects = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      // const { data, error } = await supabase
      //   .from("projects")
      //   .select("*")
      //   .eq("event_id", eventId)
      //   .eq("user_id", session.user.id)
      //   .order("created_at", { ascending: false });

      const { data: leadProjects, error: leadProjectsError } = await supabase
        .from("projects")
        .select()
        .eq("lead_email", session.user.email)
        .eq("event_id", eventId);

      //problem: teammates are not being stored as emails. This fetch will not work.
      const { data: teamProjects, error: teamProjectsError } = await supabase
        .from("projects")
        .select()
        .contains("teammates", [session.user.email])
        .eq("event_id", eventId);

      const allProjects = [...(leadProjects || []), ...(teamProjects || [])]
        .filter(
          (project, index, self) =>
            index === self.findIndex((p) => p.id === project.id)
        )
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      if (leadProjectsError || teamProjectsError) {
        console.error("Error fetching projects:", leadProjectsError || teamProjectsError);
      } else {
        setMyProjects(allProjects || []);
      }
      setIsLoading(false);
    };

    fetchMyProjects();
  }, [eventId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Participant Dashboard</h2>
        <Link href={`/events/${eventId}/submit`}>
          <Button className="button-gradient text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Submit Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : myProjects.length === 0 ? (
              <p>You haven&apos;t submitted any projects yet.</p>
            ) : (
              <ul className="space-y-4">
                {myProjects.map((project) => (
                  <li key={project.id} className="border-b pb-2">
                    <Link
                      href={`/my-project-gallery/${project.id}/dashboard`}
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
            <CardTitle>Event Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Projects Submitted</h3>
                <p className="text-2xl">{myProjects.length}</p>
              </div>
              {/* Add more progress metrics here */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals Section */}
      <Suspense fallback={<div>Loading goals...</div>}>
        <GoalSection eventId={eventId} />
      </Suspense>

      {/* Journal Section */}
      <Suspense fallback={<div>Loading journal...</div>}>
        <JournalSection eventId={eventId} />
      </Suspense>
    </div>
  );
}
