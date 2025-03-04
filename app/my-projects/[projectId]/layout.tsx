"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function MyProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Check authentication
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/select");
        return;
      }

      // Extract projectId from URL if present
      const match = pathname.match(/\/my-projects\/([^\/]+)/);
      const projectId = match ? match[1] : null;

      // If a projectId is in the URL, verify ownership or teammate status
      if (projectId && projectId !== "dashboard" && projectId !== "feedback") {
        const userEmail = session.user.email;

        // Check if user is project owner or teammate
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .select("lead_email, teammates")
          .eq("id", projectId)
          .single();

        if (projectError || !project) {
          console.error("Project not found or error:", projectError);
          router.push("/my-projects");
          return;
        }

        const isOwner = project.lead_email === userEmail;
        const isTeammate =
          Array.isArray(project.teammates) &&
          project.teammates.some((email) => email === userEmail);

        if (!isOwner && !isTeammate) {
          console.error("Unauthorized access attempt");
          router.push("/my-projects");
          return;
        }
      }

      setIsLoading(false);
    };

    checkAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/select");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-100/80">
      {children}
    </div>
  );
}
