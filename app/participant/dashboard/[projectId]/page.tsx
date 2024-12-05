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

      const storedProject = localStorage.getItem(`project_${projectId}`);
      if (storedProject) {
        setProjectData(JSON.parse(storedProject));
      } else {
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
          localStorage.setItem(`project_${projectId}`, JSON.stringify(data));
        }
      }
    };

    fetchProjectData();
  }, [projectId]);

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-blue-100/20 to-blue-900/40">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Loading project data...
          </p>
        </div>
      </div>
    );
  }

  const fullUrl = `${window.location.origin}/project/${projectId}`;

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <div className="relative z-10 w-full max-w-4xl px-4 py-8 space-y-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
          <span className="bg-clip-text text-transparent bg-black">
            Project Dashboard
          </span>
        </h1>

        <div className="bg-white/10 backdrop-blur-md p-8 rounded-lg shadow-xl">
          {/* Two-Column Layout */}
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Left Column: QR Code and Scan Info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <QRCode value={fullUrl} size={200} />
              </div>
              <div className="mt-4 text-center md:text-left">
                <p className="text-sm text-gray-700">
                  Scan this QR code to provide feedback
                </p>
              </div>
            </div>

            {/* Right Column: Project Details */}
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-semibold text-blue-900">
                Project Details
              </h2>
              <div className="space-y-2">
                <div>
                  <span className="font-bold">Project Name:</span>{" "}
                  <span>{projectData.project_name}</span>
                </div>
                <div>
                  <span className="font-bold ">Lead Name:</span>{" "}
                  <span>{projectData.lead_name}</span>
                </div>
                <div>
                  <span className="font-bold">Lead Email:</span>{" "}
                  <span>{projectData.lead_email}</span>
                </div>
              </div>
              <div className="bg-blue-100/70 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Description
                </h3>
                <p className="text-sm font-normal">
                  {projectData.project_description}
                </p>
              </div>
            </div>
          </div>

          {/* URL and Button Below the Two Columns */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-700 break-all">
              URL: {fullUrl}
            </p>
            <Link href={`/participant/feedback/${projectId}`}>
              <Button className="mt-4 w-full md:w-auto button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                See Feedback
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
