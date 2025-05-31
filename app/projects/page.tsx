"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Session } from "@supabase/supabase-js";
import { Toaster } from "@/components/ui/toaster";
import ProjectBoard from "@/features/projects/components/displays/ProjectBoard/ProjectBoard";
import { Project, ProjectBoardContext } from "@/lib/types";

export default function ProjectsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user?.email) {
        await fetchProjects(session.user.email);
      }
      setIsLoading(false);
    };

    getSession();
  }, []);

  const fetchProjects = async (userEmail: string) => {
    // Get projects where user is lead
    const { data: leadProjects } = await supabase
      .from("projects")
      .select("*")
      .eq("lead_email", userEmail);

    // Get projects where user is teammate
    const { data: teamProjects } = await supabase
      .from("projects")
      .select("*")
      .contains("teammates", [userEmail]);

    // Combine and deduplicate
    const allProjects = [
      ...(leadProjects || []),
      ...(teamProjects || []),
    ].filter(
      (proj, idx, arr) => idx === arr.findIndex((p) => p.id === proj.id)
    );

    setProjects(allProjects);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading projects...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your projects</h1>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      <div className="justify-between items-center mb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600">Manage and track your project portfolio</p>
        </div>
        <Link href="/events">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No projects found</div>
          <Link href="/events">
            <Button>Join an Event to Start a Project</Button>
          </Link>
        </div>
      ) : (
        <ProjectBoard
          isLoading={isLoading}
          projectList={projects}
          session={session}
          projectBoardContext={ProjectBoardContext.MyProjects}
        />
      )}
    </div>
  );
}