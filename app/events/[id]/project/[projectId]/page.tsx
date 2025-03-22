"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Project } from "@/lib/types";

export default function ProjectFeedbackPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const eventId = params.id as string;
  const [projectData, setProjectData] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        notFound();
        return;
      }

      setProjectData(data);
    };

    fetchProjectData();
  }, [projectId]);

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Loading project data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      <AuthNavbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Project Feedback
        </h1>

        <div className="mt-8">
          <FeedbackForm
            projectId={projectId}
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
    </div>
  );
}
