"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  created_at: string;
  teammates?: string[];
  event_id: string;
}

export default function ProjectsListPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80 pb-10">
      <Navbar />
      <main className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold">Event Projects</h1>
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
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-4">
                {projects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle className="text-blue-900 text-xl font-semibold">
                        {project.project_name}
                      </CardTitle>
                      <div className="text-gray-600 text-sm mt-2">
                        <TextGenerateEffect
                          words={project.project_description.slice(0, 100) + "..."}
                          className="text-md font-light"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Lead:</span> {project.lead_name}
                        </p>
                        {project.teammates && project.teammates.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.teammates.map((teammate, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700"
                              >
                                {teammate}
                              </span>
                            ))}
                          </div>
                        )}
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
              <div className="flex flex-col items-center justify-center space-y-4 mt-12 px-4">
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-semibold text-gray-700">
                    No Projects Yet
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    Be the first to submit a project for this event!
                  </p>
                </div>
                <Link href={`/events/${eventId}/projects`}>
                  <Button className="button-gradient text-white font-semibold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                    Submit First Project 🚀
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
}