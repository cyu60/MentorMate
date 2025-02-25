"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Download, Copy } from "lucide-react";
import FeedbackForm from "@/components/FeedbackForm";
import QRCode from "react-qr-code";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  project_url?: string;
  additional_materials_url?: string;
}

export default function ProjectPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data: project, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        router.push("/my-projects");
        return;
      }

      setProject(project);
      setIsLoading(false);
    };

    fetchProject();
  }, [params.projectId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
        <Navbar />
        <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
            <Button
              onClick={() => router.push("/my-projects")}
              className="mt-4"
            >
              Return to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => router.push("/my-projects")}
            variant="outline"
          >
            ← Back to Projects
          </Button>
          <Button
            onClick={() => router.push(`/my-projects/${params.projectId}/dashboard`)}
            variant="outline"
            className="flex items-center gap-2"
          >
            Project Dashboard
          </Button>
        </div>

        <div className="w-full max-w-4xl bg-white backdrop-blur-md p-8 rounded-lg shadow-xl mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex flex-col items-center w-full md:w-auto md:items-start">
              <div className="bg-white p-4 rounded-lg shadow-md mx-auto md:mx-0">
                <QRCode value={`${window.location.origin}/my-projects/${params.projectId}`} size={200} id="project-qr-code" />
              </div>
              <div className="mt-4 space-y-2 w-full">
                <p className="text-sm text-gray-700 text-center md:text-left">
                  Scan this QR code to provide feedback
                </p>
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button
                    onClick={async () => {
                      try {
                        const svg = document.querySelector("#project-qr-code");
                        if (!svg) throw new Error("QR Code SVG not found");

                        const canvas = document.createElement("canvas");
                        canvas.width = svg.clientWidth;
                        canvas.height = svg.clientHeight;

                        const svgData = new XMLSerializer().serializeToString(svg);
                        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
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
                          await navigator.clipboard.writeText(`${window.location.origin}/my-projects/${params.projectId}`);
                          toast({
                            title: "Copied Project URL",
                            description: "QR code image copying not supported on this device. Project URL copied instead.",
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
                    }}
                    variant="outline"
                    className="hidden md:flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </Button>
                  <Button
                    onClick={async () => {
                      try {
                        const svg = document.querySelector("#project-qr-code");
                        if (!svg) throw new Error("QR Code SVG not found");

                        const canvas = document.createElement("canvas");
                        canvas.width = svg.clientWidth;
                        canvas.height = svg.clientHeight;

                        const svgData = new XMLSerializer().serializeToString(svg);
                        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
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

                        const sanitizedProjectName = project?.project_name
                          ?.toLowerCase()
                          .replace(/[^a-z0-9]/g, "-")
                          .replace(/-+/g, "-")
                          .replace(/^-|-$/g, "");

                        const link = document.createElement("a");
                        link.download = `${sanitizedProjectName}-feedback-qr-code.png`;
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
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-blue-900">
              {project.project_name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Description</h3>
                <p className="text-gray-600">{project.project_description}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Project Lead</h3>
                <p className="text-gray-600">{project.lead_name}</p>
              </div>
              {project.project_url && (
                <div>
                  <h3 className="font-semibold text-gray-700">Project URL</h3>
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Project
                  </a>
                </div>
              )}
              {project.additional_materials_url && (
                <div>
                  <h3 className="font-semibold text-gray-700">
                    Additional Materials
                  </h3>
                  <a
                    href={project.additional_materials_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    View Materials
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <FeedbackForm
            projectId={project.id}
            projectName={project.project_name}
            projectDescription={project.project_description}
            projectLeadEmail={project.lead_email}
            projectLeadName={project.lead_name}
            project_url={project.project_url}
            additional_materials_url={project.additional_materials_url}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}