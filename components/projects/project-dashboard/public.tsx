"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Download, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Card } from "@/components/ui/card";
import SimpleFeedbackForm from "@/components/feedback/SimpleFeedbackForm";
import { FeedbackItem, Project } from "@/lib/types";

interface ProjectDashboardSectionProps {
  eventId: string;
  projectId: string;
}

export default function PublicProjectDashboardSection({
  eventId,
  projectId,
}: ProjectDashboardSectionProps) {
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  const handleCopyQR = async () => {
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

      const projectUrl = `${window.location.origin}/events/${eventId}/projects/public/${projectId}`;

      try {
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (clipboardError) {
        console.error("Error copying QR Code:", clipboardError);
        await navigator.clipboard.writeText(projectUrl);
        toast({
          title: "Copied Project URL",
          description:
            "QR code image copying not supported on this device. Project URL copied instead.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "QR Code copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying QR Code:", error);
      toast({
        title: "Error",
        description: "Failed to copy QR Code",
        variant: "destructive",
      });
    }
  };

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

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    const parts = name.split(" ");
    return parts
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId) return;
      setIsLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select(
          `
          id,
          project_name,
          project_description,
          teammates,
          lead_name,
          lead_email,
          project_url,
          additional_materials_url,
          cover_image_url
        `
        )
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
      } else {
        setProjectData(data as Project);
      }

      setIsLoading(false);
    };

    fetchProjectData();
  }, [projectId]);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!projectId) return;
      setIsLoadingFeedback(true);

      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error",
          description: "Failed to load project feedback",
          variant: "destructive",
        });
      } else {
        setFeedback(data || []);
      }

      setIsLoadingFeedback(false);
    };

    fetchFeedback();
  }, [projectId]);

  if (isLoading || !projectData) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600">
          {isLoading ? "Loading project data..." : "Project not found."}
        </p>
      </Card>
    );
  }

  const fullUrl = `${window.location.origin}/events/${eventId}/projects/public/${projectId}`;

  return (
    <Card className="p-0 overflow-hidden">
      <Toaster />
      {projectData.cover_image_url ? (
        <div
          className="w-full h-[200px] bg-[#000080] bg-cover bg-center"
          style={{
            backgroundImage: `url(${projectData.cover_image_url})`,
          }}
        />
      ) : (
        <div className="w-full h-[200px] bg-[#000080]" />
      )}
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex flex-col items-center w-full md:w-auto md:items-start">
            <div className="bg-white p-4 rounded-lg shadow-md mx-auto md:mx-0">
              <QRCode value={fullUrl} size={200} id="project-qr-code" />
            </div>
            <div className="mt-4 space-y-2 w-full">
              <p className="text-sm text-gray-700 text-center md:text-left">
                Scan this QR code to provide feedback
              </p>
              <div className="flex gap-2 justify-center md:justify-start">
                <Button
                  onClick={handleCopyQR}
                  variant="outline"
                  className="hidden md:flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </Button>
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
            <div>
              <h2 className="text-2xl font-semibold text-blue-900">
                Project Details
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-bold text-gray-800">Project Name:</span>{" "}
                <span className="text-gray-700">
                  {projectData.project_name}
                </span>
              </div>
              <div>
                <span className="font-bold text-gray-800">Submitted by:</span>
                <div className="ml-4 space-y-1 mt-1">
                  <div>
                    <span className="font-bold text-gray-600">Name:</span>{" "}
                    <span className="text-gray-700">
                      {projectData.lead_name}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-600">Email:</span>{" "}
                    <span className="text-gray-700">
                      {projectData.lead_email}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <span className="font-bold text-gray-800">Teammates:</span>{" "}
                <div className="flex flex-wrap gap-2 mt-1">
                  {projectData.teammates?.map((teammate, index) => {
                    const colors = ["blue", "deepskyblue", "royalblue", "teal"];
                    const color = colors[index % colors.length];
                    let className = "";

                    switch (color) {
                      case "deepskyblue":
                        className =
                          "inline-flex items-center rounded-full bg-sky-200 px-2 py-1 text-xs font-medium text-sky-800";
                        break;
                      case "blue":
                        className =
                          "inline-flex items-center rounded-full bg-blue-200 px-2 py-1 text-xs font-medium text-blue-800";
                        break;
                      case "teal":
                        className =
                          "inline-flex items-center rounded-full bg-teal-200 px-2 py-1 text-xs font-medium text-teal-800";
                        break;
                      case "royalblue":
                        className =
                          "inline-flex items-center rounded-full bg-blue-300 px-2 py-1 text-xs font-medium text-blue-900";
                        break;
                      default:
                        className =
                          "inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600";
                    }

                    return (
                      <span key={`${teammate}-${index}`} className={className}>
                        {teammate}
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="bg-blue-100/70 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Description
                </h3>
                <p className="text-sm font-normal text-gray-700">
                  {projectData.project_description}
                </p>
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

        {/* Feedback Section */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Project Feedback
          </h2>
          {isLoadingFeedback ? (
            <p className="text-center text-gray-600">Loading feedback...</p>
          ) : feedback.length > 0 ? (
            <ul className="space-y-6">
              {feedback.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow backdrop-blur-md"
                >
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                      {getInitials(item.mentor_name)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">
                        {item.mentor_name || "Anonymous"}
                      </span>
                      {item.mentor_email && (
                        <span className="text-sm text-gray-500">
                          ({item.mentor_email})
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{item.feedback_text}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">
                No feedback has been submitted for this project yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Be the first to provide feedback below.
              </p>
            </div>
          )}
        </div>

        {/* Add Your Perspective */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-blue-900 mb-4">
            Add Your Perspective
          </h2>
          <SimpleFeedbackForm
            projectId={projectId}
            projectName={projectData.project_name}
            projectDescription={projectData.project_description}
            projectLeadEmail={projectData.lead_email}
            eventId={eventId}
            noBorder={true}
          />
        </div>
      </div>
    </Card>
  );
}
