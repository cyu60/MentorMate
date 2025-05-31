// refactor these components out

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Calendar,
  ArrowLeft,
  QrCode,
  Copy,
  Tag,
  ExternalLink,
  Trash2
} from "lucide-react";
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
import { Session } from "@supabase/supabase-js";
import FeedbackDisplay from "@/features/projects/components/feedback/FeedbackDisplay";
import { QRCodeSection } from "@/features/projects/components/management/project-dashboard/components/QRCodeSection";
import { useQRCodeActions } from "@/features/projects/components/management/project-dashboard/hooks/useQRCodeActions";
import { toast } from "@/lib/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Project } from "@/lib/types";
import { EditableField } from "@/components/ui/editable-field";
import { updateProjectClient } from "@/features/projects/client-actions/client-update";
import { deleteProjectClient } from "@/features/projects/client-actions/client-delete";
import { TrackSelector } from "@/features/projects/components/tracks/TrackSelector";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Loading state for updates
  const [isUpdating, setIsUpdating] = useState(false);

  // Selected file for cover image upload
  const [selectedCoverImageFile, setSelectedCoverImageFile] = useState<File | null>(null);

  // Selected file for additional materials upload
  const [selectedAdditionalMaterialsFile, setSelectedAdditionalMaterialsFile] = useState<File | null>(null);

  // QR Code functionality
  const { handleCopyQR, handleDownloadQR } = useQRCodeActions(
    project?.event_id || "",
    projectId,
    project?.project_name
  );

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProject();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, projectId]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return;
    }

    setProject(data);
    
    // Check if user can edit (is lead or teammate)
    if (session?.user?.email) {
      const userEmail = session.user.email;
      const isLead = data.lead_email === userEmail;
      const isTeammate = data.teammates?.includes(userEmail);
      setCanEdit(isLead || isTeammate);
    }
  };

  // Option 1: Direct Supabase client (current approach)
  const handleUpdateTitle = async (newTitle: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const { data, error } = await updateProjectClient(projectId, { 
        project_name: newTitle 
      });

      if (error) {
        console.error("Error updating title:", error);
        toast({
          title: "Error",
          description: "Failed to update project title",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: "Project title updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating title:", error);
      toast({
        title: "Error",
        description: "Failed to update project title",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateDescription = async (newDescription: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      const { data, error } = await updateProjectClient(projectId, { 
        project_description: newDescription 
      });

      if (error) {
        console.error("Error updating description:", error);
        toast({
          title: "Error",
          description: "Failed to update project description",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: "Project description updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating description:", error);
      toast({
        title: "Error",
        description: "Failed to update project description",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateProjectUrl = async (newUrl: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      // Basic URL validation
      if (newUrl.trim() !== "") {
        try {
          // This will throw if the URL is invalid
          new URL(newUrl);
          
          // Check if URL starts with http:// or https://
          if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            toast({
              title: "Invalid URL",
              description: "URL must start with http:// or https://",
              variant: "destructive",
            });
            return false;
          }
        } catch {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid URL (e.g., https://example.com)",
            variant: "destructive",
          });
          return false;
        }
      }

      const { data, error } = await updateProjectClient(projectId, { 
        project_url: newUrl.trim() || undefined 
      });

      if (error) {
        console.error("Error updating project URL:", error);
        toast({
          title: "Error",
          description: "Failed to update project URL",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: newUrl.trim() ? "Project URL updated successfully" : "Project URL cleared successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating project URL:", error);
      toast({
        title: "Error",
        description: "Failed to update project URL",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateCoverImage = async (newUrl: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      // Basic URL validation
      if (newUrl.trim() !== "") {
        try {
          // This will throw if the URL is invalid
          new URL(newUrl);
          
          // Check if URL starts with http:// or https://
          if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            toast({
              title: "Invalid URL",
              description: "URL must start with http:// or https://",
              variant: "destructive",
            });
            return false;
          }
        } catch {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid image URL (e.g., https://example.com/image.jpg)",
            variant: "destructive",
          });
          return false;
        }
      }

      const { data, error } = await updateProjectClient(projectId, { 
        cover_image_url: newUrl.trim() || undefined 
      });

      if (error) {
        console.error("Error updating cover image:", error);
        toast({
          title: "Error",
          description: "Failed to update cover image",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: newUrl.trim() ? "Cover image updated successfully" : "Cover image cleared successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating cover image:", error);
      toast({
        title: "Error",
        description: "Failed to update cover image",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCoverImageFileUpload = async (file: File): Promise<boolean> => {
    setIsUpdating(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `project-covers/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("project-materials")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading cover image:", uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload image file",
          variant: "destructive",
        });
        return false;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-materials").getPublicUrl(filePath);

      // Update project with new URL
      const { data, error } = await updateProjectClient(projectId, { 
        cover_image_url: publicUrl 
      });

      if (error) {
        console.error("Error updating cover image:", error);
        toast({
          title: "Error",
          description: "Failed to update cover image",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: "Cover image uploaded and updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateAdditionalMaterials = async (newUrl: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      // Basic URL validation
      if (newUrl.trim() !== "") {
        try {
          // This will throw if the URL is invalid
          new URL(newUrl);
          
          // Check if URL starts with http:// or https://
          if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            toast({
              title: "Invalid URL",
              description: "URL must start with http:// or https://",
              variant: "destructive",
            });
            return false;
          }
        } catch {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid URL (e.g., https://example.com)",
            variant: "destructive",
          });
          return false;
        }
      }

      const { data, error } = await updateProjectClient(projectId, { 
        additional_materials_url: newUrl.trim() || undefined 
      });

      if (error) {
        console.error("Error updating additional materials URL:", error);
        toast({
          title: "Error",
          description: "Failed to update additional materials URL",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: newUrl.trim() ? "Additional materials URL updated successfully" : "Additional materials URL cleared successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating additional materials URL:", error);
      toast({
        title: "Error",
        description: "Failed to update additional materials URL",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateVideoUrl = async (newUrl: string): Promise<boolean> => {
    setIsUpdating(true);
    try {
      // Basic URL validation
      if (newUrl.trim() !== "") {
        try {
          // This will throw if the URL is invalid
          new URL(newUrl);
          
          // Check if URL starts with http:// or https://
          if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
            toast({
              title: "Invalid URL",
              description: "URL must start with http:// or https://",
              variant: "destructive",
            });
            return false;
          }
        } catch {
          toast({
            title: "Invalid URL",
            description: "Please enter a valid video URL (e.g., https://youtube.com/watch?v=...)",
            variant: "destructive",
          });
          return false;
        }
      }

      const { data, error } = await updateProjectClient(projectId, { 
        video_url: newUrl.trim() || undefined 
      });

      if (error) {
        console.error("Error updating video URL:", error);
        toast({
          title: "Error",
          description: "Failed to update video URL",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: newUrl.trim() ? "Video URL updated successfully" : "Video URL cleared successfully",
      });
      return true;
    } catch (error) {
      console.error("Error updating video URL:", error);
      toast({
        title: "Error",
        description: "Failed to update video URL",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAdditionalMaterialsFileUpload = async (file: File): Promise<boolean> => {
    setIsUpdating(true);
    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `project-materials/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("project-materials")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading additional materials:", uploadError);
        toast({
          title: "Upload Error",
          description: "Failed to upload file",
          variant: "destructive",
        });
        return false;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("project-materials").getPublicUrl(filePath);

      // Update project with new URL
      const { data, error } = await updateProjectClient(projectId, { 
        additional_materials_url: publicUrl 
      });

      if (error) {
        console.error("Error updating additional materials URL:", error);
        toast({
          title: "Error",
          description: "Failed to update additional materials URL",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setProject(data);
      toast({
        title: "Success",
        description: "Additional materials uploaded and updated successfully",
      });
      return true;
    } catch (error) {
      console.error("Error uploading additional materials:", error);
      toast({
        title: "Error",
        description: "Failed to upload additional materials",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsUpdating(true);
    try {
      const { success, error } = await deleteProjectClient(projectId);

      if (!success || error) {
        console.error("Error deleting project:", error);
        toast({
          title: "Error",
          description: "Failed to delete project",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Project deleted",
        description: "Your project has been successfully deleted",
      });

      // Redirect to projects list
      router.push("/projects");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setShowDeleteDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <Link href="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isLead = session?.user?.email === project.lead_email;
  const totalMembers = (project.teammates?.length || 0) + 1;
  const feedbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/projects/public/${project.id}`;

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster />
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/projects">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
        
        {/* Delete Button - Only show for project lead */}
        {isLead && (
          <div className="ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Editable Title */}
            <EditableField
              value={project.project_name}
              onSave={handleUpdateTitle}
              canEdit={canEdit}
              isLoading={isUpdating}
              className="mb-2"
              displayClassName="text-3xl font-bold text-gray-900"
              inputClassName="text-3xl font-bold text-gray-900"
              renderDisplay={(value) => (
                <h1 className="text-3xl font-bold text-gray-900 hover:text-blue-600">{value}</h1>
              )}
            />
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalMembers} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
              <Badge variant={isLead ? "default" : "secondary"}>
                {isLead ? "Project Lead" : "Team Member"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Header Image */}
        <div className="w-full h-56 mb-6 rounded-lg overflow-hidden shadow-md">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${project.cover_image_url || '/img/placeholder.png'})`
            }}
          ></div>
        </div>

        {/* Project Description Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About This Project</CardTitle>
          </CardHeader>
          <CardContent>
            <EditableField
              value={project.project_description}
              onSave={handleUpdateDescription}
              canEdit={canEdit}
              isLoading={isUpdating}
              multiline={true}
              displayClassName="text-gray-700"
              renderDisplay={(value) => (
                <p className="text-gray-700 hover:text-blue-600">{value}</p>
              )}
            />
          </CardContent>
        </Card>

        {/* Project Links Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Links</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Cover Image URL - Only show for editors */}
            {canEdit && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Cover Image:</label>
                </div>
                
                {/* URL Input */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Image URL:</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <EditableField
                        value={project.cover_image_url || ""}
                        onSave={handleUpdateCoverImage}
                        canEdit={canEdit}
                        isLoading={isUpdating}
                        placeholder="https://example.com/image.jpg"
                        displayClassName="text-blue-600 underline"
                        renderDisplay={(value) => (
                          value ? (
                            <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                              {value}
                            </span>
                          ) : (
                            <span className="text-gray-400 italic">No cover image URL set</span>
                          )
                        )}
                      />
                    </div>
                    {project.cover_image_url && (
                      <a
                        href={project.cover_image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0"
                      >
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Or upload an image file:</label>
                  
                  {!selectedCoverImageFile ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedCoverImageFile(file);
                        }
                      }}
                      disabled={isUpdating}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                  ) : (
                    <div className="space-y-3">
                      {/* File Preview */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{selectedCoverImageFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedCoverImageFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              const success = await handleCoverImageFileUpload(selectedCoverImageFile);
                              if (success) {
                                setSelectedCoverImageFile(null);
                              }
                            }}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Uploading..." : "Upload"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCoverImageFile(null)}
                            disabled={isUpdating}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                      
                      {/* Image Preview */}
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={URL.createObjectURL(selectedCoverImageFile)}
                          alt="Cover image preview"
                          className="w-full h-full object-cover"
                          onLoad={(e) => {
                            // Clean up the object URL to prevent memory leaks
                            URL.revokeObjectURL((e.target as HTMLImageElement).src);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  Note: Changes to the cover image will be reflected in the header image above.
                </p>
              </div>
            )}

            {/* Project URL */}
            <div className={canEdit ? "border-t pt-4" : ""}>
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Project URL:</label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <EditableField
                    value={project.project_url || ""}
                    onSave={handleUpdateProjectUrl}
                    canEdit={canEdit}
                    isLoading={isUpdating}
                    placeholder="https://your-project-url.com"
                    displayClassName="text-blue-600 underline"
                    renderDisplay={(value) => (
                      value ? (
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {value}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No project URL set</span>
                      )
                    )}
                  />
                </div>
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </Button>
                  </a>
                )}
              </div>
            </div>
            
            {/* Video URL */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Video URL:</label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <EditableField
                    value={project.video_url || ""}
                    onSave={handleUpdateVideoUrl}
                    canEdit={canEdit}
                    isLoading={isUpdating}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    displayClassName="text-blue-600 underline"
                    renderDisplay={(value) => (
                      value ? (
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {value}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No video URL set</span>
                      )
                    )}
                  />
                </div>
                {project.video_url && (
                  <a
                    href={project.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Watch
                    </Button>
                  </a>
                )}
              </div>
            </div>
            
            {/* Additional Materials URL */}
            <div className="border-t pt-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Additional Materials:</label>
              </div>
              
              {/* URL Input */}
              <div className="mb-4">
                <label className="text-xs font-medium text-gray-600 mb-1 block">Materials URL:</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <EditableField
                      value={project.additional_materials_url || ""}
                      onSave={handleUpdateAdditionalMaterials}
                      canEdit={canEdit}
                      isLoading={isUpdating}
                      placeholder="https://github.com/your-repo or https://docs.google.com/..."
                      displayClassName="text-blue-600 underline"
                      renderDisplay={(value) => (
                        value ? (
                          <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                            {value}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No additional materials URL set</span>
                        )
                      )}
                    />
                  </div>
                  {project.additional_materials_url && (
                    <a
                      href={project.additional_materials_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </a>
                  )}
                </div>
              </div>

              {/* File Upload - Only show for editors */}
              {canEdit && (
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Or upload a file:</label>
                  
                  {!selectedAdditionalMaterialsFile ? (
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedAdditionalMaterialsFile(file);
                        }
                      }}
                      disabled={isUpdating}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    />
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{selectedAdditionalMaterialsFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedAdditionalMaterialsFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={async () => {
                            const success = await handleAdditionalMaterialsFileUpload(selectedAdditionalMaterialsFile);
                            if (success) {
                              setSelectedAdditionalMaterialsFile(null);
                            }
                          }}
                          disabled={isUpdating}
                        >
                          {isUpdating ? "Uploading..." : "Upload"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedAdditionalMaterialsFile(null)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-gray-500">
                Examples: GitHub repository, documentation, slides, design files, PDFs, etc.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 h-auto gap-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team ({totalMembers})
          </TabsTrigger>
          <TabsTrigger value="tracks">
            <Tag className="h-4 w-4 mr-2" />
            Tracks
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
          <TabsTrigger value="qr-code">
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Project Lead</label>
                    <p className="text-gray-900">{project.lead_name} ({project.lead_email})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Team Size</label>
                    <p className="text-gray-900">{totalMembers} members</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-gray-900">{new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{project.lead_name}</p>
                    <p className="text-sm text-gray-500">{project.lead_email}</p>
                  </div>
                  <Badge>Lead</Badge>
                </div>
                
                {project.teammates?.map((teammate, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{teammate}</p>
                      <p className="text-sm text-gray-500">Team Member</p>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                ))}
              </div>
              
              {canEdit && (
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/projects/${project.id}/team`}>
                    <Button>Manage Team</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracks">
          <TrackSelector
            projectId={project.id}
            eventId={project.event_id}
            canEdit={canEdit}
            isLoading={isUpdating}
          />
        </TabsContent>

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Project Feedback</CardTitle>
              <p className="text-sm text-gray-600">
                View feedback received for this project. Share the public link below for others to provide feedback.
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-700">Public Feedback URL:</label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(feedbackUrl);
                      toast({
                        title: "Copied!",
                        description: "Feedback URL copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <FeedbackDisplay
                projectId={project.id}
                showTitle={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr-code">
          <Card>
            <CardHeader>
              <CardTitle>QR Code for Feedback</CardTitle>
              <p className="text-sm text-gray-600">
                Share this QR code to allow others to quickly access your project and provide feedback.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex flex-col items-center md:w-64">
                  <QRCodeSection
                    fullUrl={feedbackUrl}
                    onCopyQR={handleCopyQR}
                    onDownloadQR={handleDownloadQR}
                  />
                </div>
                
                <div className="flex-1 md:flex-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">How to use:</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• <strong>At presentations:</strong> Display this QR code on your slides so audience members can quickly access your project</li>
                        <li>• <strong>Mobile scanning:</strong> People can scan it with their phone camera app (no special app needed)</li>
                        <li>• <strong>Direct access:</strong> They&apos;ll be taken directly to your project&apos;s feedback page</li>
                        <li>• <strong>No typing required:</strong> Eliminates the need to type long URLs or search for your project</li>
                        <li>• <strong>Print friendly:</strong> Works great on business cards, flyers, or handouts</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Download the QR code and include it in your presentation slides</p>
                        <p>• Add it to your project documentation or README files</p>
                        <p>• Print it on handouts for easy feedback collection at events</p>
                        <p>• Share it on social media to gather broader feedback</p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">📱 Best Practices:</h5>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>• Ensure QR code is large enough to scan (minimum 2cm x 2cm when printed)</p>
                        <p>• Test the QR code before your presentation</p>
                        <p>• Provide the direct link as a backup option</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <strong> &quot;{project?.project_name}&quot;</strong> and all associated data including:
              <br /><br />
              • Project details and description
              <br />
              • Team member assignments
              <br />
              • Track selections
              <br />
              • All feedback received
              <br />
              • Uploaded materials
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isUpdating ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}