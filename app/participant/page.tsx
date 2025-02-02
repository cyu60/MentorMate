"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProjectSubmissionFormComponent } from "@/components/ProjectSubmissionForm";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";

interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
}

export default function ParticipantPage() {
  const router = useRouter();
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "submit">("projects"); // Track the active tab
  const [session, setSession] = useState<Session | null>(null); // State to hold session data

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const projects: Project[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("project_")) {
          const project = JSON.parse(localStorage.getItem(key) || "{}");
          projects.push(project);
        }
      }
      setExistingProjects(projects);
      setIsLoading(false);
    };

    const fetchSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      if (!session) {
        router.push("/"); 
      } else {
        setSession(session); 
      }
    };

    fetchProjects();
    fetchSession(); 
  }, [router]);

  const handleSignOutClick = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      setSession(null);
      router.push("/");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
        <Button
          size="lg"
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-red-700 transition-all duration-300 mb-2"
          onClick={handleSignOutClick}
        >
          Sign Out
        </Button>
        {session && (
          <div className="text-sm text-gray-700">
            Logged in as: {session.user.email}
          </div>
        )}
      </div>
      <Navbar />
      <div className="relative z-10 container mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
          {/* <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-400"> */}
          Participant Dashboard
          {/* </span> */}
        </h1>

        {/* Navigation for Projects / Submit Project */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={() => setActiveTab("projects")}
            className={`text-md py-2 px-4 rounded-full transition-all duration-300 ${
              activeTab === "projects"
                ? "bg-blue-900 text-white"
                : "bg-transparent border-2 border-blue-300 text-black hover:bg-blue-500/30"
            }`}
          >
            View Projects
          </Button>
          <Button
            onClick={() => setActiveTab("submit")}
            className={`text-md py-2 px-4 rounded-full transition-all duration-300 ${
              activeTab === "submit"
                ? "bg-blue-900 text-white"
                : "bg-transparent border-2 border-blue-300 text-black hover:bg-blue-500/30"
            }`}
          >
            Submit a Project
          </Button>
        </div>

        {/* Loading / Projects Section */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
          </div>
        ) : (
          <>
            {activeTab === "projects" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <h2 className="text-xl font-semibold mt-6 mb-6 text-black px-20">
                  Your Projects
                </h2>
                {existingProjects.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-20">
                    {existingProjects.map((project) => (
                      <Card
                        key={project.id}
                        className="bg-white backdrop-blur-md border-blue-200/20 hover:bg-white/20 transition-all duration-300"
                      >
                        <CardHeader>
                          <CardTitle className="text-blue-900 text-xl font-semibold">
                            {project.project_name}
                          </CardTitle>
                          <CardDescription className="text-blue-100 text-sm">
                            <TextGenerateEffect
                              words={project.project_description.slice(0, 100) + "..."}
                              className="text-md font-light"
                            />
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Link href={`/participant/dashboard/${project.id}`}>
                            <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                              View Project
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 text-md font-bold"> No Project Submitted</p> 
                )}
              </motion.div>
            )}

            {activeTab === "submit" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 px-4 sm:px-6 md:px-8 lg:px-40"
              >
                <Card className="bg-white backdrop-blur-md border-blue-200/20">
                  <CardContent className="p-4 sm:p-6">
                    <ProjectSubmissionFormComponent
                      userEmail={session?.user?.email} // Pass user email from session
                      leadName={session?.user?.user_metadata?.full_name} // Pass user display name from session
                    />
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
          )}
        </div>
      </div>
  );
}
