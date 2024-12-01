"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";

interface ProjectData {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
}

export default function ParticipantDashboard() {
  const { projectId } = useParams();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;

      // Try to get project data from local storage first
      const storedProject = localStorage.getItem(`project_${projectId}`);
      if (storedProject) {
        setProjectData(JSON.parse(storedProject));
      } else {
        // If not in local storage, fetch from Supabase
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
          // Store in local storage
          localStorage.setItem(`project_${projectId}`, JSON.stringify(data));
        }
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (!projectData) {
    return <div>Loading...</div>;
  }

  const fullUrl = `${window.location.origin}/project/${projectId}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-8">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <QRCode value={fullUrl} size={200} />
        </div>
        <p className="text-sm text-gray-600">
          Scan this QR code to provide feedback
        </p>
        <p className="text-xs text-gray-500 break-all">URL: {fullUrl}</p>

        <div className="w-full max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
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

        <Link href={`/participant/feedback/${projectId}`}>
          <Button>See Feedback</Button>
        </Link>
      </div>
    </div>
  );
}
