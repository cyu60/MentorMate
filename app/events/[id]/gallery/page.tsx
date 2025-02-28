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

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  teammates?: string[];
  event_id: string;
}

export default function GalleryPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="space-y-6 py-8 px-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold">Project Gallery</h2>
        <Link href={`/events/${eventId}/projects`}>
          <Button className="button-gradient text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Submit Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 relative flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white text-center px-4">{project.project_name}</h3>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{project.lead_name}&apos;s Team</CardTitle>
                    <div className="text-gray-600 mt-2">
                      <TextGenerateEffect
                        words={project.project_description.slice(0, 100) + "..."}
                        className="text-md font-light"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {project.teammates?.map((teammate, index) => (
                          <Badge key={index} variant="secondary">
                            {teammate}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Link href={`/events/${eventId}/projects/${project.id}`}>
                      <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 mt-12">
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-700">
                  No Projects Yet
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Be the first to submit a project for this event!
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
