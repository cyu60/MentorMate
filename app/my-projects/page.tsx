"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ReturnUrlHandler } from '@/components/auth/ReturnUrlHandler';
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Footer } from '@/components/layout/footer';

interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  created_at: string;
  teammates: string[];
  project_url?: string;
  additional_materials_url?: string;
  cover_image_url?: string;
}

export default function MyProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/project_dashboard");
        return;
      }
      setSession(session);
    };
    fetchSession();
  }, [router]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!session?.user?.email) return;
      setIsLoading(true);

      // Fetch projects where user is either the lead or a teammate
      // First get projects where user is lead
      const { data: leadProjects } = await supabase
        .from("projects")
        .select()
        .eq("lead_email", session.user.email);

      // Then get projects where user is a teammate
      const { data: teamProjects } = await supabase
        .from("projects")
        .select()
        .contains("teammates", [session.user.email]);

      // Combine and deduplicate projects
      const allProjects = [
        ...(leadProjects || []),
        ...(teamProjects || [])
      ].filter((project, index, self) =>
        index === self.findIndex((p) => p.id === project.id)
      );

      setProjects(
        allProjects.sort((a: Project, b: Project) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      );
      setIsLoading(false);
    };

    fetchProjects();
  }, [session]);

  return (
    <div className="min-h-full bg-blue-50 pt-10">
      <AuthNavbar />
      <ReturnUrlHandler />
      <div className="container mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-blue-900">
          My Projects
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            {projects.length > 0 ? (
              <>
                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto px-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="overflow-hidden">
                      <div 
                        className="h-[200px] w-full bg-[#000080]"
                        style={project.cover_image_url ? {
                          backgroundImage: `url(${project.cover_image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        } : undefined}
                      />
                      <div className="p-6 space-y-4">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-xl font-semibold">
                              {project.project_name}
                            </CardTitle>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                              {project.lead_email === session?.user?.email ? 'Owner' : 'Team Member'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Lead: {project.lead_name}</p>
                        </div>
                        <CardDescription className="text-gray-600 text-sm">
                          {project.project_description.slice(0, 100) + "..."}
                        </CardDescription>
                        <Link href={`/my-projects/${project.id}/dashboard`} className="block">
                          <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4 mt-12 px-4">
                <div className="text-center space-y-3">
                  <h3 className="text-xl font-semibold text-gray-700">
                    No Projects Found
                  </h3>
                  <p className="text-gray-500 max-w-sm">
                    You are not currently part of any projects.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}