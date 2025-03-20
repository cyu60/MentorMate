"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import ProjectBoard from "@/components/projects/ProjectBoard/ProjectBoard";
import { ProjectBoardContext } from "@/components/projects/ProjectBoard/ProjectBoardContext.enum";

interface Project {
    id: string;
    project_name: string;
    project_description: string;
    lead_name: string;
    lead_email: string;
    teammates?: string[];
    event_id: string;
    created_at: string;
    project_url?: string;
    additional_materials_url?: string;
    cover_image_url?: string;
}

export default function GalleryPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Sets 'projects' state to a list of projects the event_id is associated with
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data || []);
      }
      setIsLoading(false);
    };

    fetchProjects();
  }, [eventId]);

  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold">Project Gallery</h2>
            <Link href={`/events/${eventId}/projects`}>
                <Button className="button-gradient text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Submit Project
                </Button>
            </Link>
        </div>

        <div className="mb-8">
            <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border rounded-md"
            />
        </div>

        <ProjectBoard 
            isLoading={isLoading}
            projectList={filteredProjects}
            projectBoardContext={ProjectBoardContext.EventGallery}

        />


    
    </div>
  );
}
