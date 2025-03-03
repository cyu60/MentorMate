"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ChevronDown } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";

interface ProjectData {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  teammates: string[];
  project_url?: string | null;
  additional_materials_url?: string | null;
  event_id: string;
}

export default function PublicProjectPage() {
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

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

  const handleDownloadQR = async () => {
    try {
      const svg = document.querySelector("#project-qr-code");
      if (!svg) throw new Error("QR Code SVG not found");

      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = svgUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
      });

      const sanitizedProjectName = projectData?.project_name
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const link = document.createElement("a");
      link.download = `${sanitizedProjectName}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error downloading QR Code:", error);
      toast({
        title: "Error",
        description: "Failed to download QR Code",
        variant: "destructive",
      });
    }
  };

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
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Project not found.
          </p>
        </div>
      </div>
    );
  }

  const fullUrl = `${window.location.origin}/public-project/${projectId}`;

  return (
    <div>
      <Toaster />
      <Navbar />
      <div className="relative flex flex-col items-center justify-start min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 pb-10 mt-10">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-black">
              {projectData.project_name}
            </span>
          </h1>
        </div>

        <div className="w-full max-w-4xl bg-white backdrop-blur-md p-8 rounded-lg shadow-xl">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex flex-col items-center w-full md:w-auto md:items-start">
              <div className="bg-white p-4 rounded-lg shadow-md mx-auto md:mx-0">
                <QRCode value={fullUrl} size={200} id="project-qr-code" />
              </div>
              <div className="mt-4 space-y-2 w-full">
                <p className="text-sm text-gray-700 text-center md:text-left">
                  Scan this QR code to share this project
                </p>
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button
                    onClick={handleDownloadQR}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Project Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {projectData.project_description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-blue-900">Team</h3>
                  <p className="text-gray-700">
                    <span className="font-medium">Lead:</span>{" "}
                    {projectData.lead_name}
                  </p>
                  {projectData.teammates &&
                    projectData.teammates.length > 0 && (
                      <div className="mt-1">
                        <span className="font-medium">Team Members:</span>{" "}
                        {projectData.teammates.join(", ")}
                      </div>
                    )}
                </div>

                {(projectData.project_url ||
                  projectData.additional_materials_url) && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Project Resources
                    </h3>
                    {projectData.project_url && (
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
                    )}
                    {projectData.additional_materials_url && (
                      <div className="flex items-center gap-2">
                        <Download className="w-4 h-4 text-gray-600" />
                        <a
                          href={projectData.additional_materials_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Download Project Materials
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className="mt-8 w-full max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Button
              variant="ghost"
              className="w-full p-4 flex items-center justify-between text-lg font-semibold text-blue-900"
              onClick={() => setFeedbackOpen(!feedbackOpen)}
            >
              <span>Provide Feedback</span>
              <ChevronDown
                className={`h-5 w-5 text-blue-900 transition-transform duration-200 ${
                  feedbackOpen ? "rotate-180" : ""
                }`}
              />
            </Button>

            {feedbackOpen && (
              <div className="p-6 border-t">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Share Your Thoughts
                  </h3>
                  <p className="text-gray-700">
                    Your feedback helps the project team improve and refine
                    their work.
                  </p>

                  <FeedbackForm
                    projectId={projectData.id}
                    projectName={projectData.project_name}
                    projectDescription={projectData.project_description}
                    projectLeadEmail={projectData.lead_email}
                    projectLeadName={projectData.lead_name}
                    project_url={projectData.project_url}
                    additional_materials_url={
                      projectData.additional_materials_url
                    }
                    eventId={projectData.event_id}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
