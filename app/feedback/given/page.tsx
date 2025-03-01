"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/app/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface FeedbackItem {
  id: string;
  project_id: string;
  project_name: string;
  feedback_text: string;
  created_at: string;
}

export default function GivenFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchGivenFeedback() {
      try {
        setIsLoading(true);

        // Get current user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          setError("You must be logged in to view your feedback");
          setIsLoading(false);
          return;
        }

        // Fetch feedback given by current user
        const { data, error } = await supabase
          .from("feedback")
          .select(
            `
            id,
            project_id,
            feedback_text,
            created_at,
            projects:project_id (project_name)
          `
          )
          .eq("mentor_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Format the data to include project name
        const formattedData = data.map((item) => ({
          id: item.id,
          project_id: item.project_id,
          project_name: item.projects?.[0]?.project_name || "Unknown Project",
          feedback_text: item.feedback_text,
          created_at: item.created_at,
        }));

        setFeedback(formattedData);
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchGivenFeedback();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-bold mb-8">Given Feedback</h1>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">Loading your feedback...</span>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      ) : feedback.length > 0 ? (
        <div className="grid gap-6">
          {feedback.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span>{item.project_name}</span>
                  <span className="text-sm font-normal text-gray-500">
                    {formatDate(item.created_at)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{item.feedback_text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No feedback given yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
