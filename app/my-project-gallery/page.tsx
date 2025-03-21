"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ReturnUrlHandler } from "@/components/auth/ReturnUrlHandler";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Footer } from "@/components/layout/footer";
import ProjectBoard from "@/components/projects/ProjectBoard/ProjectBoard"
import { ProjectBoardContext } from "@/components/projects/ProjectBoard/ProjectBoardContext.enum";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  teammates?: string[];
  event_id: string;
  created_at: string;
  project_url?: string;
  additional_materials_url?: string;
  cover_image_url?: string;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/project_dashboard");
        return;
      }
      setSession(session);
    };
    fetchSession();
  }, [router]);

  // Sets 'projects' state to a list of projects the user is associated with
  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.email) return;
      setIsLoading(true);

      const { data: leadProjects } = await supabase
        .from("projects")
        .select()
        .eq("lead_email", session.user.email);

      const { data: teamProjects } = await supabase
        .from("projects")
        .select()
        .contains("teammates", [session.user.email]);

      const allProjects = [
        ...(leadProjects || []),
        ...(teamProjects || []),
      ].filter((project, index, self) =>
        index === self.findIndex((p) => p.id === project.id)
      );

      setProjects(
        allProjects.sort((a: Project, b: Project) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setIsLoading(false);
    };

    fetchProjects();
  }, [session]);

  return (
    <div className="min-h-full bg-gray-50 pt-10">
      <AuthNavbar />
      <ReturnUrlHandler />
      <div className="container mx-auto px-4 pb-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-blue-900">
                  My Projects
              </h1>
              <p className="mt-2 text-gray-600">
                  Manage your projects and collaborate with your team.
              </p>
        </div>
        <ProjectBoard
          isLoading={isLoading} 
          projectList={projects} 
          session={session ?? undefined}
          projectBoardContext={ProjectBoardContext.MyProjects}
        />
      </div>
      <Footer />
    </div>
  );
}