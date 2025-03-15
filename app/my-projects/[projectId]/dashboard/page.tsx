"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Loader2 } from "lucide-react";
import ProjectDashboardSection from "@/components/project-dashboard-section";
import { HackathonNav } from "@/components/hackathon-nav";
import EventHeader from "@/components/event-header";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Project {
  id: string;
  event_id: string;
  event_name: string;
}

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          event_id,
          events (
            name
          )
        `)
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        return;
      }

      setProject(data);
      setIsLoading(false);
    };

    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <Navbar />
        <div className="relative z-10 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="relative flex flex-col items-center justify-start min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 pb-10 pt-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-black">
              Project Dashboard
            </span>
          </h1>
        </div>

        <div className="w-full max-w-4xl px-4 sm:px-0 mb-6">
          <Link href="/my-projects">
            <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back to My Projects</span>
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-4xl">
          <ProjectDashboardSection 
            projectId={projectId as string} 
            eventId={project.event_id} 
          />
        </div>
      </div>
    </div>
  );
}
