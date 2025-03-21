"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from '@/components/layout/navbar';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import FeedbackForm from '@/components/feedback/FeedbackForm';

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  project_url?: string;
  additional_materials_url?: string;
  event_id: string;
}

export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const resolvedParams = React.use(params);

  useEffect(() => {
    const fetchProject = async () => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", resolvedParams.projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        router.push("/my-project-gallery");
        return;
      }

      setProject(project);
      setIsLoading(false);
    };

    fetchProject();
  }, [resolvedParams.projectId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Project not found
            </h1>
            <Button
              onClick={() => router.push("/my-project-gallery")}
              className="mt-4"
            >
              Return to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <Button onClick={() => router.push("/my-project-gallery")} variant="outline">
            ← Back to Projects
          </Button>
          <Button
            onClick={() =>
              router.push(`/my-project-gallery/${resolvedParams.projectId}/dashboard`)
            }
            variant="outline"
            className="flex items-center gap-2"
          >
            Project Dashboard
          </Button>
        </div>

        <div className="mt-8">
          <FeedbackForm
            projectId={project.id}
            projectName={project.project_name}
            projectDescription={project.project_description}
            projectLeadEmail={project.lead_email}
            projectLeadName={project.lead_name}
            project_url={project.project_url}
            additional_materials_url={project.additional_materials_url}
            eventId={project.event_id}
          />
        </div>
      </div>
    </div>
  );
}
