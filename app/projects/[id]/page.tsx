"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  Tag
} from "lucide-react";
import { Session } from "@supabase/supabase-js";
import FeedbackDisplay from "@/features/projects/components/feedback/FeedbackDisplay";
import { QRCodeSection } from "@/features/projects/components/management/project-dashboard/components/QRCodeSection";
import { useQRCodeActions } from "@/features/projects/components/management/project-dashboard/hooks/useQRCodeActions";
import { toast } from "@/lib/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Project } from "@/lib/types";
import { EditableField } from "@/components/ui/editable-field";
import { updateProjectClient } from "@/features/projects/client-actions/client-update";
import { TrackSelector } from "@/features/projects/components/tracks/TrackSelector";

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  
  // Loading state for updates
  const [isUpdating, setIsUpdating] = useState(false);

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

        <Card>
          <CardContent className="pt-6">
            {/* Editable Description */}
            <EditableField
              value={project.project_description}
              onSave={handleUpdateDescription}
              canEdit={canEdit}
              isLoading={isUpdating}
              multiline={true}
              displayClassName="text-gray-700 mb-4"
              renderDisplay={(value) => (
                <p className="text-gray-700 mb-4 hover:text-blue-600">{value}</p>
              )}
            />
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
    </div>
  );
}