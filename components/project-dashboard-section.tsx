"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { notFound, useRouter } from "next/navigation";
import { Edit2, X, Download, Copy, ExternalLink, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import UserSearch from "@/components/UserSearch";
import { Card } from "@/components/ui/card";

interface ProjectData {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  teammates: string[];
  project_url?: string | null;
  additional_materials_url?: string | null;
}

interface FeedbackItem {
  id: string;
  project_id: string;
  mentor_name: string;
  mentor_email?: string;
  feedback_text: string;
  rating: number;
  created_at: string;
}

interface ProjectDashboardSectionProps {
  eventId: string;
  projectId: string;
}

export default function ProjectDashboardSection({
  eventId,
  projectId,
}: ProjectDashboardSectionProps) {
  const router = useRouter();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ProjectData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true);

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) throw error;

      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted",
      });

      router.push(`/events/${eventId}/gallery`);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const getFileNameFromUrl = (url: string) => {
    const pathParts = url.split("/");
    const fileName = pathParts[pathParts.length - 1];
    return decodeURIComponent(fileName.split("?")[0]);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("saved") === "true") {
      toast({
        title: "Success",
        description: "Project information updated successfully",
      });
      window.history.replaceState({}, "", window.location.pathname);
    }

    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("display_name");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      if (data) {
        const displayNames = data.map((user) => user.display_name);
        setAvailableUsers(displayNames);
      }
    };

    fetchUsers();
  }, []);

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
          additional_materials_url
        `
        )
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        notFound();
      } else {
        setProjectData(data);
        setEditedData(data);
        if (data.additional_materials_url) {
          setCurrentFileName(getFileNameFromUrl(data.additional_materials_url));
        }
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
      let additionalMaterialsUrl = editedData.additional_materials_url;

      if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE) {
          toast({
            title: "Error",
            description: "File size must be less than 10MB",
            variant: "destructive",
          });
          return;
        }

        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `project-materials/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("project-materials")
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("project-materials").getPublicUrl(filePath);

        additionalMaterialsUrl = publicUrl;
        setCurrentFileName(fileName);
      }

      const { error } = await supabase
        .from("projects")
        .update({
          project_name: editedData.project_name,
          lead_name: editedData.lead_name,
          lead_email: editedData.lead_email,
          project_description: editedData.project_description,
          teammates: editedData.teammates,
          project_url: editedData.project_url || null,
          additional_materials_url: additionalMaterialsUrl,
        })
        .eq("id", projectId);

      if (error) throw error;

      setProjectData({
        ...editedData,
        additional_materials_url: additionalMaterialsUrl,
      });
      setIsEditing(false);
      setSelectedFile(null);
      window.location.href = `${window.location.pathname}?saved=true`;
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project information",
        variant: "destructive",
      });
    }
  };

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

      const projectUrl = `${window.location.origin}/events/${eventId}/dashboard/${projectId}`;

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

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600">Loading project data...</p>
      </Card>
    );
  }

  if (!projectData) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-600">Project not found.</p>
      </Card>
    );
  }

  const fullUrl = `${window.location.origin}/events/${eventId}/dashboard/${projectId}`;

  return (
    <Card className="p-6">
      <Toaster />
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
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-blue-900">
              Project Details
            </h2>
            {!isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="destructive"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
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
                  {projectData.teammates.map((teammate, index) => {
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submitted by:
                </label>
                <div className="ml-4 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">
                      Name
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
                    <label className="block text-sm font-bold text-gray-600 mb-1">
                      Email
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
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project URL (Optional)
                </label>
                <Input
                  type="url"
                  value={editedData?.project_url || ""}
                  onChange={(e) =>
                    setEditedData((prev) => ({
                      ...prev!,
                      project_url: e.target.value,
                    }))
                  }
                  placeholder="Github/Devpost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Materials
                </label>
                <div className="space-y-2">
                  {!selectedFile &&
                    editedData?.additional_materials_url &&
                    currentFileName && (
                      <div className="flex items-center gap-2 mb-2">
                        <Download className="w-4 h-4 text-gray-600" />
                        <a
                          href={editedData.additional_materials_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm"
                        >
                          {currentFileName}
                        </a>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setEditedData((prev) => ({
                              ...prev!,
                              additional_materials_url: null,
                            }));
                            setCurrentFileName(null);
                          }}
                          className="px-2 py-1 ml-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  {(!editedData?.additional_materials_url || selectedFile) && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        {!editedData?.additional_materials_url ? (
                          <input
                            key={
                              editedData?.additional_materials_url || "new-file"
                            }
                            type="file"
                            onChange={(e) => {
                              const files = e.target.files;
                              if (files && files.length > 0) {
                                const file = files[0];
                                setSelectedFile(file);
                                setCurrentFileName(file.name);
                                setEditedData((prev) => ({
                                  ...prev!,
                                  additional_materials_url: null,
                                }));
                              }
                            }}
                            accept=".pdf,.ppt,.pptx,.doc,.docx"
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                          />
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".pdf,.ppt,.pptx,.doc,.docx";
                              input.onchange = (e) => {
                                const files = (e.target as HTMLInputElement)
                                  .files;
                                if (files && files.length > 0) {
                                  setSelectedFile(files[0]);
                                  setEditedData((prev) => ({
                                    ...prev!,
                                    additional_materials_url: null,
                                  }));
                                }
                              };
                              input.click();
                            }}
                            className="w-full"
                          >
                            Choose New File
                          </Button>
                        )}
                      </div>
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            setCurrentFileName(
                              projectData?.additional_materials_url
                                ? getFileNameFromUrl(
                                    projectData.additional_materials_url
                                  )
                                : null
                            );
                            setEditedData((prev) => ({
                              ...prev!,
                              additional_materials_url:
                                projectData?.additional_materials_url || null,
                            }));
                          }}
                          className="px-2 py-1"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Upload pitch deck or other project materials (max 10MB)
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teammates
                </label>
                <UserSearch
                  allTags={availableUsers}
                  initialTags={editedData?.teammates || []}
                  onTagsChange={(teammates) =>
                    setEditedData((prev) => ({
                      ...prev!,
                      teammates,
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
                    <div className="ml-auto flex items-center"></div>
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
              Share your QR code with others to start receiving feedback.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
