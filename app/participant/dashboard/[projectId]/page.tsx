"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Edit2, X } from "lucide-react"; // Added Edit2 and X icons
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";


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
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProjectData | null>(null);

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
        setEditedData(data);
      }

      setIsLoading(false);
    };

    fetchProjectData();
  }, [projectId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(projectData);
  };

  const handleSave = async () => {
    if (!editedData) return;

    try {
      const { error } = await supabase
        .from("projects")
        .update({
          project_name: editedData.project_name,
          lead_name: editedData.lead_name,
          lead_email: editedData.lead_email,
          project_description: editedData.project_description,
        })
        .eq("id", projectId);

      if (error) throw error;

      setProjectData(editedData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Project information updated successfully",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project information",
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
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Project not found.
          </p>
        </div>
      </div>
    );
  }

  const fullUrl = `${window.location.origin}/project/${projectId}`;

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 p-10">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
          <span className="bg-clip-text text-transparent bg-black">
            Project Dashboard
          </span>
        </h1>
      </div>

      <div className="w-full max-w-4xl mb-6">
        <Link href="/participant">
          <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center">
            <ChevronLeft />
            Dashboard
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-4xl bg-white backdrop-blur-md p-8 rounded-lg shadow-xl">
        <div className="flex flex-col md:flex-row items-start gap-8">
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

          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-blue-900">
                Project Details
              </h2>
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="button-gradient text-white"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex items-center"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="space-y-2">
                <div>
                  <span className="font-bold text-gray-800">Project Name:</span>{" "}
                  <span className="text-gray-700">
                    {projectData.project_name}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-800">Lead Name:</span>{" "}
                  <span className="text-gray-700">{projectData.lead_name}</span>
                </div>
                <div>
                  <span className="font-bold text-gray-800">Lead Email:</span>{" "}
                  <span className="text-gray-700">
                    {projectData.lead_email}
                  </span>
                </div>
                <div className="bg-blue-100/70 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Description
                  </h3>
                  <p className="text-sm font-normal text-gray-700">
                    {projectData.project_description}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <Input
                    value={editedData?.project_name}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev!,
                        project_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Name
                  </label>
                  <Input
                    value={editedData?.lead_name}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev!,
                        lead_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Email
                  </label>
                  <Input
                    type="email"
                    value={editedData?.lead_email}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev!,
                        lead_email: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={editedData?.project_description}
                    onChange={(e) =>
                      setEditedData((prev) => ({
                        ...prev!,
                        project_description: e.target.value,
                      }))
                    }
                    rows={4}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-700 break-all">
            URL:{" "}
            <a href={fullUrl} className="text-blue-500 underline">
              {fullUrl}
            </a>
          </p>
          <Link href={`/participant/feedback/${projectId}`}>
            <Button className="mt-4 w-full md:w-auto button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              See Feedback
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
