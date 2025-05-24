"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProjectBoard from "@/components/projects/ProjectBoard/ProjectBoard";
import { ProjectBoardContext, Project } from "@/lib/types";
import { useEventRegistration } from "@/components/event-registration-provider";
import { EventRole } from "@/lib/types";
import { isValidUUID } from "@/app/utils/supabase/queries";

export default function GalleryPage() {
  const params = useParams();
  const slug = params.id as string;
  const [eventId, setEventId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { isRegistered, userRole } = useEventRegistration();

  useEffect(() => {
    const resolveEventId = async () => {
      const isUUID = isValidUUID(slug);

      let query = supabase.from("events").select("event_id");

      if (isUUID) {
        // If it's a UUID, check both slug and event_id
        query = query.or(`slug.eq.${slug},event_id.eq.${slug}`);
      } else {
        // If it's not a UUID, only check slug
        query = query.eq("slug", slug);
      }

      const { data } = await query.maybeSingle();
      if (data) setEventId(data.event_id);
    };
    resolveEventId();
  }, [slug]);

  // Sets 'projects' state to a list of projects the event_id is associated with
  useEffect(() => {
    if (!eventId) return;
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

  if (!eventId) {
    return <div>Loading...</div>;
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.project_description
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold">Project Gallery</h2>
        {isRegistered && userRole === EventRole.Participant && (
          <Link href={`/events/${eventId}/submit`}>
            <Button className="button-gradient text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Submit Project
            </Button>
          </Link>
        )}
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
