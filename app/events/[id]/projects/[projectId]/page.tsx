"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Edit2, X, Download, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/navbar";
import UserSearch from "@/components/utils/UserSearch";
import { fetchProjectById } from "@/lib/helpers/projects";
import {
  Project,
  EventRole,
  ScoringCriterion,
  ScoreFormData,
} from "@/lib/types";
import { useEventRegistration } from "@/components/event-registration-provider";
import { ProjectScoringForm } from "@/components/scoring/project-scoring-form";

// Default scoring criteria if none are configured for the event
const defaultCriteria: ScoringCriterion[] = [
  {
    id: "technical",
    name: "Technical Implementation",
    description: "Quality of code, technical complexity, and implementation",
    weight: 1,
  },
  {
    id: "innovation",
    name: "Innovation",
    description: "Originality, creativity, and uniqueness of the solution",
    weight: 1,
  },
  {
    id: "impact",
    name: "Impact",
    description: "Potential impact and real-world applicability",
    weight: 1,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Quality of documentation, demo, and overall presentation",
    weight: 1,
  },
];

export default function ProjectDetails() {
  const params = useParams();
  const eventId = params?.id as string;
  const projectId = params?.projectId as string;
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<string[]>([]);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(defaultCriteria);
  const [existingScore, setExistingScore] = useState<ScoreFormData | null>(
    null
  );
  const { userRole } = useEventRegistration();

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
    const loadProject = async () => {
      if (!projectId) return;
      setIsLoading(true);

      try {
        // Fetch project data
        const project = await fetchProjectById(projectId as string);
        if (!project) {
          notFound();
        }
        setProjectData(project);
        setEditedData(project);
        if (project.additional_materials_url) {
          setCurrentFileName(
            getFileNameFromUrl(project.additional_materials_url)
          );
        }

        // Fetch event scoring config
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("scoring_config")
          .eq("id", eventId)
          .single();

        if (eventError) {
          console.error("Error fetching event scoring config:", eventError);
        } else if (eventData?.scoring_config?.criteria) {
          setCriteria(eventData.scoring_config.criteria);
        }

        // If user is a judge, fetch their existing score for this project
        if (userRole === EventRole.Judge || userRole === EventRole.Admin) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const { data: scoreData } = await supabase
              .from("project_scores")
              .select("*")
              .eq("project_id", projectId)
              .eq("judge_id", session.user.id)
              .single();

            if (scoreData) {
              setExistingScore(scoreData);
            }
          }
        }
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, eventId, userRole]);

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

  const fullUrl = `${window.location.origin}/events/${eventId}/projects/${projectId}/feedback`;

  return (
    <div>
      <Toaster />
      <Navbar />
      <div className="relative flex flex-col items-center justify-start min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 pb-10">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-black">
              Project Details
            </span>
          </h1>
        </div>

        <div className="w-full max-w-4xl px-4 sm:px-0 mb-6">
          <Link href={`/events/${eventId}/projects`}>
            <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back to Projects</span>
            </Button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="flex flex-col items-center w-full md:w-auto md:items-start">
            <div className="bg-white p-4 rounded-lg shadow-md mx-auto md:mx-0">
              <QRCode value={fullUrl} size={200} id="project-qr-code" />
            </div>
            <div className="mt-4 space-y-2 w-full">
              <p className="text-sm text-gray-700 text-center md:text-left">
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
                    {projectData.teammates?.map((teammate, index) => (
                      <span
                        key={`${teammate}-${index}`}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {teammate}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
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
                      setEditedData((prev: Project | null) => ({
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
                          setEditedData((prev: Project | null) => ({
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
                          setEditedData((prev: Project | null) => ({
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
                      setEditedData((prev: Project | null) => ({
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
                    {!selectedFile && editedData?.additional_materials_url && (
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
                            setEditedData((prev: Project | null) => ({
                              ...prev!,
                              additional_materials_url: undefined,
                            }));
                            setCurrentFileName(null);
                          }}
                          className="px-2 py-1 ml-2"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          setSelectedFile(files[0]);
                          setCurrentFileName(files[0].name);
                        }
                      }}
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
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
                      setEditedData((prev: Project | null) => ({
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
                      setEditedData((prev: Project | null) => ({
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

        {/* Scoring Section for Judges */}
        {(userRole === EventRole.Judge || userRole === EventRole.Admin) && (
          <div className="w-full max-w-4xl mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-blue-900 mb-6">
                Project Scoring
              </h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Scoring Criteria</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {criteria.map((criterion) => (
                    <div
                      key={criterion.id}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <h4 className="font-medium">{criterion.name}</h4>
                      <p className="text-sm text-gray-600">
                        {criterion.description}
                      </p>
                      {criterion.weight && criterion.weight !== 1 && (
                        <p className="text-sm text-blue-600 mt-1">
                          Weight: {criterion.weight}x
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <ProjectScoringForm
                projectId={projectId}
                criteria={criteria}
                existingScore={existingScore}
                onScoreSubmitted={() => {
                  toast({
                    title: "Success",
                    description: "Score submitted successfully",
                  });
                }}
              />
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-700 break-all">
            Feedback URL:{" "}
            <a href={fullUrl} className="text-blue-500 underline">
              {fullUrl}
            </a>
          </p>
          <Link href={`/events/${eventId}/projects/${projectId}/feedback`}>
            <Button className="mt-4 w-full md:w-auto button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              See Feedback
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
