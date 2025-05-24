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
  Edit, 
  Users, 
  MessageSquare, 
  Settings, 
  ExternalLink, 
  Calendar,
  ArrowLeft 
} from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  teammates: string[];
  project_url: string | null;
  additional_materials_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  event_id: string;
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

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

  return (
    <div className="container mx-auto px-4 py-8">
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.project_name}</h1>
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
          
          {canEdit && (
            <div className="flex gap-2">
              <Link href={`/projects/${project.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Link href={`/projects/${project.id}/settings`}>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">{project.project_description}</p>
            
            <div className="flex gap-4">
              {project.project_url && (
                <a 
                  href={project.project_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live Project
                </a>
              )}
              {project.additional_materials_url && (
                <a 
                  href={project.additional_materials_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4" />
                  Additional Materials
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">
            <Users className="h-4 w-4 mr-2" />
            Team ({totalMembers})
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href={`/projects/${project.id}/feedback`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View Feedback
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}/team`} className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Manage Team
                    </Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/projects/${project.id}/edit`} className="block">
                      <Button variant="outline" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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

        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Project Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">View and manage feedback for this project.</p>
              <Link href={`/projects/${project.id}/feedback`}>
                <Button>View All Feedback</Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}