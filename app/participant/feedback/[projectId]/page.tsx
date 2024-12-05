"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface FeedbackItem {
  id: string;
  feedback_text: string;
  mentor_name: string;
  mentor_email: string;
}

interface ProjectData {
  id: string;
  project_name: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      setIsLoading(true);

      // Fetch project data
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Error fetching project:", projectError);
        notFound();
        return;
      }

      setProjectData(projectData);

      // Fetch feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (feedbackError) {
        console.error("Error fetching feedback:", feedbackError);
        setFeedback([]); // Clear feedback on error
      } else {
        setFeedback(feedbackData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Loading project data...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Project not found.</p>
        </div>
      </div>
    );
  }

  const fullUrl = `${window.location.origin}/project/${projectId}`;

  // Function to get initials from mentor's name
  const getInitials = (name: string) => {
    const names = name.trim().split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
  };

  return (
    <div className="container mx-auto p-10 bg-gradient-to-b min-h-screen from-white to-blue-100/80">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Feedback for {projectData.project_name}
      </h1>
      <div className="mb-6">
        <Link href={`/participant/dashboard/${projectId}`}>
          <Button className="button-gradient text-white font-semibold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center">
            <ChevronLeft/>
            Project Details
          </Button>
        </Link>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        {feedback.length > 0 ? (
          <ul className="space-y-6">
            {feedback.map((item) => (
              <li
                key={item.id}
                className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow backdrop-blur-md"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                    {getInitials(item.mentor_name)}
                  </div>
                </div>
                {/* Comment Content */}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">{item.mentor_name}</span>
                    <span className="text-sm text-gray-500">({item.mentor_email})</span>
                  </div>
                  <p className="mt-2 text-gray-700">{item.feedback_text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No feedback received yet.</p>
        )}
      </div>
    </div>
  );
}
