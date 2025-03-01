"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectData {
  id: string;
  project_name: string;
  lead_name: string;
  project_description: string;
  teammates: string[];
  project_url?: string | null;
  background_image_url?: string | null;
}

export default function PublicProjectDetails() {
  const params = useParams();
  const eventId = params?.id as string;
  const projectId = params?.projectId as string;
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select("id, project_name, lead_name, project_description, teammates, project_url, background_image_url")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        notFound();
      } else {
        setProjectData(data);
      }

      setIsLoading(false);
    };

    fetchProjectData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Project not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="relative flex flex-col items-center justify-start min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 pb-10">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-black">
              Project Details
            </span>
          </h1>
        </div>

        <div className="w-full max-w-4xl px-4 sm:px-0 mb-6">
          <Link href={`/events/${eventId}/projects`}>
            <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back to Projects</span>
            </Button>
          </Link>
        </div>

        <div 
          className="w-full max-w-4xl bg-white backdrop-blur-md p-8 rounded-lg shadow-xl relative overflow-hidden"
          style={{
            backgroundImage: projectData.background_image_url 
              ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${projectData.background_image_url})`
              : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="space-y-4">
            <div>
              <span className="font-bold text-gray-800">Project Name:</span>{" "}
              <span className="text-gray-700">{projectData.project_name}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800">Team Lead:</span>{" "}
              <span className="text-gray-700">{projectData.lead_name}</span>
            </div>
            <div>
              <span className="font-bold text-gray-800">Team Members:</span>{" "}
              <div className="flex flex-wrap gap-2 mt-1">
                {projectData.teammates.map((teammate, index) => (
                  <span
                    key={`${teammate}-${index}`}
                    className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                  >
                    {teammate}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Description
              </h3>
              <p className="text-sm font-normal text-gray-700">
                {projectData.project_description}
              </p>
            </div>
            {projectData.project_url && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Project Resources
                </h3>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-600" />
                  <a
                    href={projectData.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Project Repository
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}