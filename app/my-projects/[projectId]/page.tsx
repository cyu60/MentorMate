"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  project_url?: string;
  additional_materials_url?: string;
}

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        router.push("/my-projects");
        return;
      }

      setProject(project);
      setIsLoading(false);
    };

    fetchProject();
  }, [params.projectId, router]);

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
            <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
            <Button
              onClick={() => router.push("/my-projects")}
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
        <Button
          onClick={() => router.push("/my-projects")}
          variant="outline"
          className="mb-6"
        >
          ← Back to Projects
        </Button>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900">
              {project.project_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{project.project_description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Project Lead</h3>
                <p className="text-gray-600">{project.lead_name}</p>
              </div>
              {project.project_url && (
                <div>
                  <h3 className="font-semibold text-gray-700">Project URL</h3>
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Project
                  </a>
                </div>
              )}
              {project.additional_materials_url && (
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Additional Materials
                  </h3>
                  <a
                    href={project.additional_materials_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Materials
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <FeedbackForm
            projectId={project.id}
            projectName={project.project_name}
            projectDescription={project.project_description}
            projectLeadEmail={project.lead_email}
            projectLeadName={project.lead_name}
            project_url={project.project_url}
            additional_materials_url={project.additional_materials_url}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}