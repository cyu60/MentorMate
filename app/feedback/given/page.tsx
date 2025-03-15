"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackWithProject {
  id: string;
  project_id: string;
  project_name: string;
  feedback_text: string;
  mentor_name: string;
  mentor_email: string;
  created_at: string;
}

export default function GivenFeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<FeedbackWithProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserFeedback = async () => {
      try {
        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsLoading(false);
          return;
        }

        // Fetch feedback given by the current user
        const { data, error } = await supabase
          .from("feedback")
          .select("*")
          .eq("mentor_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // If we have feedback entries, fetch the corresponding projects
        if (data && data.length > 0) {
          const projectIds = data.map((item) => item.project_id);

          const { data: projectsData, error: projectsError } = await supabase
            .from("projects")
            .select("id, project_name")
            .in("id", projectIds);

          if (projectsError) {
            throw projectsError;
          }

          // Create a map of project IDs to project names
          const projectMap = new Map(
            projectsData.map((project) => [project.id, project.project_name])
          );

          // Combine feedback with project names
          const formattedData = data.map((item) => ({
            ...item,
            project_name: projectMap.get(item.project_id) || "Unknown Project",
          }));

          setFeedbackList(formattedData);
        } else {
          setFeedbackList([]);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        toast({
          title: "Error",
          description: "Failed to load your feedback history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFeedback();
  }, [toast]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
  };

  return (
    <div className="container m-0 p-0 sm:p-10 bg-blue-50 min-w-full min-h-screen">
      <Navbar />
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-blue-900">
        Feedback You&apos;ve Given
      </h1>

      <div className="w-full max-w-4xl px-4 sm:px-0 mb-6 mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            <span className="ml-2 text-lg text-blue-900">
              Loading your feedback...
            </span>
          </div>
        ) : feedbackList.length > 0 ? (
          <div className="space-y-6">
            {feedbackList.map((item) => (
              <Card
                key={item.id}
                className="bg-white shadow hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-blue-900">
                      {item.project_name}
                    </CardTitle>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                        {getInitials(item.mentor_name)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {item.feedback_text}
                      </p>
                      <div className="mt-4">
                        <Link href={`/public-project/${item.project_id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-900 hover:text-blue-700"
                          >
                            View Project
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              You haven&apos;t given any feedback yet
            </h3>
            <p className="text-gray-600 mb-6">
              When you provide feedback to projects, they&apos;ll appear here.
            </p>
            <Link href="/events">
              <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                Browse Events to Give Feedback
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
