"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  teammates: string[];
  created_at: string;
}

export default function JoinProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const token = params.token as string;
  
  const [session, setSession] = useState<Session | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState<'idle' | 'success' | 'error' | 'already_member'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      setErrorMessage("Project not found or invite link is invalid.");
    } else {
      setProject(data);
      return data;
    }
  };

  const checkMembership = async (userEmail: string, projectData?: Project) => {
    const proj = projectData || project;
    if (!proj) return;
    
    const isLead = proj.lead_email === userEmail;
    const isTeammate = proj.teammates?.includes(userEmail);
    
    if (isLead || isTeammate) {
      setJoinStatus('already_member');
    }
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user?.email) {
        const projectData = await fetchProject();
        if (projectData) {
          await checkMembership(session.user.email, projectData);
        }
      }
      setIsLoading(false);
    };

    getSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);


  const handleJoinProject = async () => {
    if (!session?.user?.email || !project) return;
    
    setIsJoining(true);
    
    try {
      // Add user to teammates array
      const currentTeammates = project.teammates || [];
      const updatedTeammates = [...currentTeammates, session.user.email];
      
      const { data, error } = await supabase
        .from("projects")
        .update({ teammates: updatedTeammates })
        .eq("id", projectId)
        .select()
        .single();

      if (error) {
        setErrorMessage(error.message);
        setJoinStatus('error');
      } else {
        setProject(data);
        setJoinStatus('success');
        
        // Redirect to project page after 2 seconds
        setTimeout(() => {
          router.push(`/projects/${projectId}`);
        }, 2000);
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setJoinStatus('error');
    }
    
    setIsJoining(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading invitation...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Join Project</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">Please log in to join this project.</p>
            <Link href={`/login?returnUrl=${encodeURIComponent(window.location.pathname)}`}>
              <Button className="w-full">Login to Continue</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project || errorMessage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              {errorMessage || "This invitation link is invalid or has expired."}
            </p>
            <Link href="/projects">
              <Button>Browse Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinStatus === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Successfully Joined!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              Welcome to <strong>{project.project_name}</strong>! 
              You&apos;re now part of the team.
            </p>
            <p className="text-sm text-gray-500">Redirecting to project page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (joinStatus === 'already_member') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <CardTitle>Already a Member</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You&apos;re already a member of <strong>{project.project_name}</strong>.
            </p>
            <Link href={`/projects/${projectId}`}>
              <Button className="w-full">Go to Project</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalMembers = (project.teammates?.length || 0) + 1;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle>You&apos;re Invited to Join</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Project Info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {project.project_name}
            </h2>
            <p className="text-gray-600 mb-4">{project.project_description}</p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalMembers} members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Team Preview */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Current Team</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm">{project.lead_name}</span>
                <Badge>Lead</Badge>
              </div>
              {project.teammates?.slice(0, 3).map((teammate, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{teammate}</span>
                  <Badge variant="secondary">Member</Badge>
                </div>
              ))}
              {(project.teammates?.length || 0) > 3 && (
                <div className="text-center text-sm text-gray-500">
                  +{(project.teammates?.length || 0) - 3} more members
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {joinStatus === 'error' && (
            <Alert className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Join Button */}
          <Button 
            onClick={handleJoinProject} 
            disabled={isJoining}
            className="w-full"
            size="lg"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Joining Project...
              </>
            ) : (
              'Join Project'
            )}
          </Button>

          <div className="text-center mt-4">
            <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700">
              Browse other projects
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}