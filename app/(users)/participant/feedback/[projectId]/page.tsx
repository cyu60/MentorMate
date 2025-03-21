"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Project, FeedbackItem } from "@/lib/types";

export default function FeedbackPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;

      setIsLoading(true);

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

      const { data: feedbackData, error: feedbackError } = await supabase
        .from("feedback")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (feedbackError) {
        console.error("Error fetching feedback:", feedbackError);
        setFeedback([]);
        toast({
          title: "Error",
          description: "Failed to fetch feedback. Please try again later.",
          variant: "destructive",
        });
      } else {
        setFeedback(feedbackData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [projectId, toast]);

  const handleSynthesizeFeedback = async () => {
    try {
      setIsSynthesizing(true);
      setSynthesis(null);

      const response = await fetch("/api/feedback/synthesize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: projectId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to synthesize feedback");
      }

      setSynthesis(data.synthesis);
    } catch (error) {
      console.error("Error synthesizing feedback:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to synthesize feedback. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Loading ...</p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80">
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Project not found.
          </p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
  };

  return (
    <div className="container m-0 p-0 sm:p-10 bg-gradient-to-b min-w-full min-h-screen from-white to-blue-100/80">
      <Navbar />
      <h1 className="text-3xl font-bold mb-8 text-center">
        Feedback for {projectData.project_name}
      </h1>
      <div className="w-full max-w-4xl px-4 sm:px-0 mb-6 mx-auto">
        <div className="flex justify-between items-center">
          <Link href={`/participant/dashboard/${projectId}`}>
            <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Project Details</span>
            </Button>
          </Link>
          <Button
            onClick={handleSynthesizeFeedback}
            disabled={isLoading || isSynthesizing || feedback.length === 0}
            className="bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Synthesizing...
              </>
            ) : (
              "Synthesize Feedback with AI"
            )}
          </Button>
        </div>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        {synthesis && (
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl text-blue-900">
                AI Feedback Synthesis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {synthesis.split("\n").map((line, index) => (
                  <p key={index} className="mb-4">
                    {line}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {feedback.length > 0 ? (
          <ul className="space-y-6">
            {feedback.map((item) => (
              <li
                key={item.id}
                className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow backdrop-blur-md"
              >
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-900 flex items-center justify-center text-white font-bold">
                    {getInitials(item.mentor_name)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">
                      {item.mentor_name || "Anonymous Mentor"}
                    </span>
                    {item.mentor_email && (
                      <span className="text-sm text-gray-500">
                        ({item.mentor_email})
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700">{item.feedback_text}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 mt-12 px-4">
            <div className="text-center space-y-3">
              <h3 className="text-xl font-semibold text-gray-700">
                No Feedback Yet
              </h3>
              <p className="text-gray-500 max-w-sm">
                Share your project with mentors to receive valuable feedback and
                insights!
              </p>
            </div>
            <Link href={`/participant/dashboard/${projectId}`}>
              <Button className="button-gradient text-white font-semibold py-6 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg">
                Request Your First Feedback! 💡
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
