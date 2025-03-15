"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import FeedbackForm from "@/components/FeedbackForm";
import {
  Download,
  ExternalLink,
  ChevronDown,
  Share2,
  Award,
  Users,
} from "lucide-react";

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
  event_name?: string;
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
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
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
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
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
    <div className="bg-blue-50">
      <Toaster />
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-12 px-6 mb-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">
              {projectData.project_name}
            </h1>
            <p className="text-base md:text-lg text-white/90">
              A project by {projectData.lead_name} and team.
            </p>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-1 bg-white/10 py-1 px-3 rounded-full text-sm">
                <Share2 className="w-4 h-4" />
                <span>
                  Submitted to {projectData.event_name || "Unknown Event"}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Project Video or Screenshot Placeholder */}
          <div className="mt-6 md:mt-0">
            <div className="bg-white rounded-md text-black p-4 text-center w-[300px] h-[200px]">
              <p className="font-semibold">[ Video / Image Placeholder ]</p>
              <p className="text-sm text-gray-700">
                Embed a video or screenshot here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Main Content */}
          <div className="flex-1 space-y-8">
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {projectData.project_description}
              </p>
            </section>
          </div>

          {/* Right Column: Project Info & QR Code */}
          <aside className="w-full md:w-80 flex-shrink-0 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Created by
              </h3>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Lead:</span> {projectData.lead_name}
              </p>
              {projectData.teammates && projectData.teammates.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Team Members:</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2 mt-1">
                    {projectData.teammates.map((teammate) => (
                      <li key={teammate}>{teammate}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {(projectData.project_url || projectData.additional_materials_url) && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
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

            <div className="bg-white rounded-lg shadow p-6 space-y-4 text-center">
              <div className="inline-block bg-white p-2 rounded-lg shadow">
                <QRCode value={fullUrl} size={160} id="project-qr-code" />
              </div>
              <p className="text-sm text-gray-600">
                Scan this QR code to share this project
              </p>
              <Button
                variant="outline"
                className="flex items-center gap-2 mx-auto"
                onClick={handleDownloadQR}
              >
                <Download className="w-4 h-4" />
                Download QR
              </Button>
            </div>
          </aside>
        </div>

        {/* Feedback Section */}
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
                  Your feedback helps the project team improve and refine their work.
                </p>
                <FeedbackForm
                  projectId={projectData.id}
                  projectName={projectData.project_name}
                  projectDescription={projectData.project_description}
                  projectLeadEmail={projectData.lead_email}
                  projectLeadName={projectData.lead_name}
                  project_url={projectData.project_url}
                  additional_materials_url={projectData.additional_materials_url}
                  eventId={projectData.event_id}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
