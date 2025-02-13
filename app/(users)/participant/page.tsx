"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ReturnUrlHandler } from "@/components/ReturnUrlHandler";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Project {
  id: string;
  project_name: string;
  lead_name: string;
  lead_email: string;
  project_description: string;
  created_at: string;
  teammates?: string[];
  isTeammate?: boolean;
}

export default function ParticipantPage() {
  console.log("ParticipantPage component is rendering");
  const router = useRouter();
  const [existingProjects, setExistingProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "submit">("projects");
  const [session, setSession] = useState<Session | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        router.push("/login");
        return;
      }
      if (!session) {
        router.push("/login");
      } else {
        setSession(session);
        console.log("Session in participant page:", session);
        const returnUrl = localStorage.getItem("returnUrl");
        if (returnUrl) {
          localStorage.removeItem("returnUrl");
          router.push(returnUrl);
        }
      }
    };
    fetchSession();
  }, [router]);

  const fetchProjects = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);

    console.log("Fetching projects for email:", session.user.email);

    let userProfile;
    const { data: existingProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select()
      .eq("email", session.user.email)
      .single();

    if (profileError && profileError.code === "PGRST116") {
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          email: session.user.email,
          display_name: session.user.email?.split("@")[0],
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating user profile:", createError);
        setIsLoading(false);
        return;
      }
      userProfile = newProfile;
    } else if (profileError) {
      console.error("Error fetching user profile:", profileError);
      setIsLoading(false);
      return;
    } else {
      userProfile = existingProfile;
    }

    console.log("User profile:", userProfile);

    const { data: ownedProjects, error: ownedError } = await supabase
      .from("projects")
      .select("*")
      .eq("lead_email", session.user.email);

    console.log("Owned projects:", ownedProjects);

    const { data: teammateProjects, error: teammateError } = await supabase
      .from("projects")
      .select("*")
      .contains("teammates", [userProfile.display_name]);

    console.log("Teammate projects:", teammateProjects);

    if (ownedError) {
      console.error("Error fetching owned projects:", ownedError);
    }
    if (teammateError) {
      console.error("Error fetching teammate projects:", teammateError);
    }

    const owned = (ownedProjects || []).map((p) => ({
      ...p,
      isTeammate: false,
    }));
    const teammate = (teammateProjects || []).map((p) => ({
      ...p,
      isTeammate: true,
    }));

    const allProjects = [...owned, ...teammate].filter(
      (project, index, self) =>
        index === self.findIndex((p) => p.id === project.id)
    );

    setExistingProjects(
      allProjects.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );
    console.log("Fetched projects:", allProjects);

    setIsLoading(false);
  }, [session, setIsLoading, setExistingProjects]);

  useEffect(() => {
    fetchProjects();
  }, [session, fetchProjects]);

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete || !session?.user?.email) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectToDelete)
      .eq("lead_email", session.user.email);

    if (error) {
      console.error("Error deleting project:", error);
    } else {
      fetchProjects();
    }

    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80 pb-10">
      <Navbar />
      <ReturnUrlHandler />
      <div>
        <main className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-10 text-center">
            Participant Dashboard
          </h1>

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
                  {existingProjects.length > 0 ? (
                    <>
                      <h2 className="text-xl font-semibold mt-6 mb-6 text-black px-20">
                        Your Projects
                      </h2>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-20">
                        {existingProjects.map((project) => (
                          <Card key={project.id}>
                            <CardHeader>
                              <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-blue-900 text-xl font-semibold">
                                  {project.project_name}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  {project.isTeammate && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                                      Team Member
                                    </span>
                                  )}
                                  {project.lead_email ===
                                    session?.user?.email && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-700 hover:bg-red-100"
                                      onClick={() =>
                                        handleDeleteClick(project.id)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <CardDescription className="text-gray-600 text-sm mt-2">
                                <TextGenerateEffect
                                  words={
                                    project.project_description.slice(0, 100) +
                                    "..."
                                  }
                                  className="text-md font-light"
                                />
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <Link
                                href={`/participant/dashboard/${project.id}`}
                              >
                                <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                                  View Project
                                </Button>
                              </Link>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-4 mt-12 px-4">
                      <div className="text-center space-y-3">
                        <h3 className="text-xl font-semibold text-gray-700">
                          No Projects Yet
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                          Start your journey by creating your first project. It
                          only takes a few minutes!
                        </p>
                      </div>
                      <Button
                        onClick={() => setActiveTab("submit")}
                        className="button-gradient text-white font-semibold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                      >
                        Create Your First Project! 🚀
                      </Button>
                    </div>
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
                        userEmail={session?.user?.email}
                        leadName={session?.user?.user_metadata?.full_name}
                        onProjectSubmitted={() => {
                          console.log(
                            "Project submitted, fetching updated projects..."
                          );
                          setActiveTab("projects");
                          fetchProjects();
                        }}
                      />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
          <div className="mt-16">
            <Footer />
          </div>
        </main>
      </div>
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={() => setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
