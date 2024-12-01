"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

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
        return;
      }

      setFeedback(feedbackData);
    };

    fetchData();
  }, [projectId]);

  if (!projectData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Feedback for {projectData.project_name}
      </h1>
      <div className="mb-6">
        <Link href={`/participant/dashboard/${projectId}`}>
          <Button variant="outline">Back to Project Details</Button>
        </Link>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        {feedback.length > 0 ? (
          <ul className="space-y-4">
            {feedback.map((item) => (
              <li key={item.id} className="bg-white p-4 rounded-lg shadow">
                <p className="text-gray-800">{item.feedback_text}</p>
                <p className="text-sm text-gray-600 mt-2">
                  - {item.mentor_name} ({item.mentor_email})
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No feedback received yet.</p>
        )}
      </div>
    </div>
  );
}
