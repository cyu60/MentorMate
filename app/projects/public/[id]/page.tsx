"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Calendar, 
  ExternalLink, 
  ArrowLeft 
} from "lucide-react";

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

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
      } else {
        setProject(data);
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [projectId]);


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
          <p className="text-gray-600 mb-4">
            This project may be private or no longer exists.
          </p>
          <Link href="/projects">
            <Button>Browse Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalMembers = (project.teammates?.length || 0) + 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Badge variant="outline">Public Project</Badge>
        </div>

        {/* Project Showcase */}
        <div className="max-w-4xl mx-auto">
          {/* Cover Image */}
          {project.cover_image_url && (
            <div className="mb-8 relative w-full h-64">
              <Image
                src={project.cover_image_url} 
                alt={`${project.project_name} cover`}
                fill
                className="object-cover rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* Project Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {project.project_name}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalMembers} team members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              {project.project_url && (
                <a 
                  href={project.project_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View Live Project
                  </Button>
                </a>
              )}
              {project.additional_materials_url && (
                <a 
                  href={project.additional_materials_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="lg" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Additional Materials
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Project Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed">
                {project.project_description}
              </p>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Meet the Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{project.lead_name}</p>
                    <p className="text-sm text-gray-600">Project Lead</p>
                  </div>
                  <Badge>Lead</Badge>
                </div>
                
                {project.teammates?.map((teammate, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{teammate}</p>
                      <p className="text-sm text-gray-600">Team Member</p>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-blue-900 text-white">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4">Interested in Similar Projects?</h3>
              <p className="text-blue-100 mb-6">
                Join our community to discover more innovative projects and connect with creators.
              </p>
              <Link href="/events">
                <Button variant="secondary" size="lg">
                  Explore Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}