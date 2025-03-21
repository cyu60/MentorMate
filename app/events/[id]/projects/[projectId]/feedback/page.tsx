"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Navbar } from "@/components/layout/navbar";
import { Project } from "@/lib/types";
export default function ProjectFeedback() {
  const params = useParams();
  const eventId = params.id as string;
  const projectId = params.projectId as string;
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
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
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Loading project data...
          </p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Project not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <FeedbackForm
          projectId={projectData.id}
          projectName={projectData.project_name}
          projectDescription={projectData.project_description}
          projectLeadEmail={projectData.lead_email}
          projectLeadName={projectData.lead_name}
          project_url={projectData.project_url}
          additional_materials_url={projectData.additional_materials_url}
          eventId={eventId}
        />
      </div>
    </div>
  );
}
