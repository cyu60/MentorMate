"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/app/utils/supabase/client";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Bot } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { SubmissionConfirmation } from "./SubmissionConfirmation";

interface AISuggestions {
  "more specific": string;
  "more actionable": string;
  "more positive": string;
}

interface FeedbackData {
  project_id: string;
  project_name: string;
  project_email: string;
  project_lead_name: string;
  project_description: string;
  mentor_id: string;
  mentor_name: string;
  mentor_email: string;
  original_feedback: string;
  final_feedback: string;
  specific_ai_suggestion: string;
  positive_ai_suggestion: string;
  actionable_ai_suggestion: string;
}

export default function FeedbackForm({
  projectId,
  projectName,
  projectDescription,
  projectLeadEmail,
  projectLeadName,
}: {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectLeadEmail: string;
  projectLeadName: string;
}) {
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [hasImprovedWithAI, setHasImprovedWithAI] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseClient] = useState(() => createClient());

  useEffect(() => {
    console.log("Initializing Supabase session");
    supabaseClient.auth.getSession().then(({ data: { session: currentSession } }: { data: { session: Session | null } }) => {
      console.log("Got session:", currentSession);
      setSession(currentSession);
    });

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      console.log("Auth state changed:", session);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  const improveWithAI = async () => {
    if (hasImprovedWithAI) return;
    setIsGeneratingAI(true);

    localStorage.setItem("originalFeedback", feedback);

    try {
      const url = "https://magicloops.dev/api/loop/b59e7eb1-4d27-4fa7-8411-543646f3ee2f/run";
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          feedback: feedback,
          "project description": projectDescription,
        }),
      });
      const responseJson = await response.json();
      setAiSuggestions(responseJson);
      setHasImprovedWithAI(true);
    } catch (error) {
      console.error("Error generating AI suggestions:", error);
      alert("Failed to generate AI suggestions. Please try again.");
    } finally {
      setIsGeneratingAI(false);
      setShowSubmitButton(true);
    }
  };

  const logFeedbackToMagicLoop = async (feedbackData: FeedbackData) => {
    const url = "https://magicloops.dev/api/loop/d72bea64-246a-4c95-98d1-d7a9b90da991/run";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(feedbackData),
      });
      const responseJson = await response.json();
      console.log("Magic Loop API response:", responseJson);
    } catch (error) {
      console.error("Error logging feedback to Magic Loop:", error);
    }
  };

  const submitFeedback = async () => {
    if (!session?.user) {
      console.error("No user session found");
      return;
    }

    try {
      console.log("Starting feedback submission with session:", session.user);
      const originalFeedback = localStorage.getItem("originalFeedback") || feedback;

      const feedbackData: FeedbackData = {
        project_id: projectId,
        project_name: projectName,
        project_description: projectDescription,
        project_email: projectLeadEmail,
        project_lead_name: projectLeadName,
        mentor_id: session.user.id,
        mentor_name: session.user.user_metadata?.full_name || 'Unknown',
        mentor_email: session.user.email || '',
        original_feedback: originalFeedback,
        final_feedback: feedback,
        specific_ai_suggestion: aiSuggestions?.["more specific"] || "",
        positive_ai_suggestion: aiSuggestions?.["more positive"] || "",
        actionable_ai_suggestion: aiSuggestions?.["more actionable"] || "",
      };

      // First get the project UUID
      const { data: projectData, error: projectError } = await supabaseClient
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error("Project lookup error:", projectError);
        throw projectError;
      }

      console.log("Found project:", projectData);

      // Then submit feedback with the project UUID and let Supabase handle id generation
      const { data, error } = await supabaseClient.from("feedback").insert([{
        project_id: projectData.id,
        mentor_id: session.user.id,
        mentor_name: session.user.user_metadata?.full_name || 'Unknown',
        feedback_text: feedback,
      }]);

      if (error) {
        console.error("Supabase error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details
        });
        throw error;
      }

      console.log("Feedback submitted successfully:", data);

      // Log to Magic Loop API
      await logFeedbackToMagicLoop(feedbackData);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(`Error submitting feedback: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem("originalFeedback");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      alert("Please log in to submit feedback.");
      return;
    }
    setIsSubmitting(true);
    await submitFeedback();
  };

  useEffect(() => {
    const pendingFeedback = localStorage.getItem("pendingFeedback");
    if (pendingFeedback) {
      const parsedFeedback = JSON.parse(pendingFeedback);
      setFeedback(parsedFeedback.final_feedback);
      setAiSuggestions({
        "more specific": parsedFeedback.specific_ai_suggestion,
        "more positive": parsedFeedback.positive_ai_suggestion,
        "more actionable": parsedFeedback.actionable_ai_suggestion,
      });
    }
  }, []);

  if (!session) {
    return (
      <div className="text-center p-4">
        <p>Please log in to submit feedback.</p>
      </div>
    );
  }

  if (isSubmitted) {
    return <SubmissionConfirmation projectName={projectName} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-5xl mx-auto px-4"
    >
      {/* Project Details */}
      <div className="bg-white shadow-lg rounded-lg">
        <div className="border-b border-blue-200 pb-4 p-6">
          <h2 className="text-blue-900 text-2xl font-semibold">
            {projectName}
          </h2>
          <p className="text-black text-md">{projectDescription}</p>
          <p className="text-black text-sm">
            <strong>Lead Name:</strong> {projectLeadName}
          </p>
          <p className="text-black text-sm">
            <strong>Lead Email:</strong> {projectLeadEmail}
          </p>
        </div>

        {/* Feedback Section */}
        <div className="space-y-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-6 text-gray-800">
              <h3 className="font-medium text-xl mb-3">
                Consider in your feedback:
              </h3>
              <ul className="list-decimal pl-6 space-y-2 text-lg">
                <li>What should they do next to improve the project?</li>
                <li>What could be better or work differently?</li>
                <li>
                  What works well, and are there similar projects to learn from?
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-blue-900 mb-2"
              >
                Leave Your Feedback
              </label>
              <TextareaAutosize
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback here"
                required
                minRows={4}
                className="w-full bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-md p-2"
              />
            </div>

            {/* AI Improvement Button */}
            {!hasImprovedWithAI && (
              <Button
                type="button"
                onClick={improveWithAI}
                disabled={isGeneratingAI || feedback.trim().length === 0}
                className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Improving...
                  </>
                ) : (
                  <>
                    <Bot />
                    Improve Feedback with AI
                  </>
                )}
              </Button>
            )}

            {/* AI Suggestions */}
            {aiSuggestions && (
              <Card className="bg-blue-50 border-blue-200 mt-4 p-4 rounded-lg">
                <h3 className="text-blue-900 text-lg font-semibold mb-4">
                  AI Suggestions:
                </h3>
                <ul className="space-y-6">
                  {Object.entries(aiSuggestions).map(
                    ([category, suggestion]) => (
                      <li key={category} className="flex flex-col space-y-2">
                        <div>
                          <strong className="text-blue-900 capitalize">
                            {category.replace(/_/g, " ")}:
                          </strong>
                          <p className="mt-1">{suggestion}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => setFeedback(suggestion)}
                            className="bg-blue-900 text-white text-sm py-1 px-3 rounded-full"
                          >
                            Replace
                          </Button>
                          <Button
                            type="button"
                            onClick={() =>
                              setFeedback((prev) => `${prev}\n\n${suggestion}`)
                            }
                            className="bg-green-700 text-white text-sm py-1 px-3 rounded-full"
                          >
                            Add Below
                          </Button>
                        </div>
                      </li>
                    )
                  )}
                </ul>
              </Card>
            )}

            {/* Submit Button */}
            {showSubmitButton && !isSubmitting && (
              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-900 text-white py-2 px-4 rounded-full shadow-lg mt-4"
              >
                Submit Feedback
              </Button>
            )}
          </form>
        </div>
      </div>
    </motion.div>
  );
}