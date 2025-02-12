"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import FeedbackForm from "@/components/FeedbackForm";
import type { Session } from "@supabase/supabase-js";
import { Navbar } from "@/components/navbar";
import { LogIn } from "lucide-react";
import Link from "next/link";

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
  const [session, setSession] = useState<Session | null>(null);

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

    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
      } else {
        setSession(session);
      }
    };

    fetchProjectData();
    fetchSession();
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
      <Navbar />
      <h1 className="text-3xl font-bold text-center">Project Feedback</h1>
      <div className="mt-8">
        <FeedbackForm
          projectId={projectId}
          projectName={projectData.project_name}
          projectDescription={projectData.project_description}
          projectLeadEmail={projectData.lead_email}
          projectLeadName={projectData.lead_name}
          userName={session?.user?.user_metadata?.full_name}
          userEmail={session?.user?.email}
        />
      </div>
    </div>
  );
}
