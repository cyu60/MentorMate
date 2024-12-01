"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import FeedbackForm from "@/components/FeedbackForm";

interface ProjectData {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
}

export default function ProjectFeedbackPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Project Feedback</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Project Details</h2>
        <p>
          <strong>Project Name:</strong> {projectData.project_name}
        </p>
        <p>
          <strong>Lead Name:</strong> {projectData.lead_name}
        </p>
        <p>
          <strong>Lead Email:</strong> {projectData.lead_email}
        </p>
        <p>
          <strong>Description:</strong> {projectData.project_description}
        </p>
      </div>
      <FeedbackForm
        projectId={projectId}
        projectName={projectData.project_name}
        projectDescription={projectData.project_description}
      />
    </div>
  );
}
