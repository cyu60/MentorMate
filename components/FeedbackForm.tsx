"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { MentorRegistrationModal } from "./MentorRegistrationModal";
import { SubmissionConfirmation } from "./SubmissionConfirmation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { SparklesCore } from "@/components/ui/sparkles";
import { Loader2, Bot } from "lucide-react";

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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [hasImprovedWithAI, setHasImprovedWithAI] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);

  const improveWithAI = async () => {
    if (hasImprovedWithAI) return;
    setIsGeneratingAI(true);

    // Save the original feedback to local storage
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

  const submitFeedback = async (
    mentorId: string,
    mentorName: string,
    mentorEmail: string
  ) => {
    try {
      const originalFeedback =
        localStorage.getItem("originalFeedback") || feedback;

      const feedbackData: FeedbackData = {
        project_id: projectId,
        project_name: projectName,
        project_description: projectDescription,
        project_email: projectLeadEmail,
        project_lead_name: projectLeadName,
        mentor_id: mentorId,
        mentor_name: mentorName,
        mentor_email: mentorEmail,
        original_feedback: originalFeedback,
        final_feedback: feedback,
        specific_ai_suggestion: aiSuggestions?.["more specific"] || "",
        positive_ai_suggestion: aiSuggestions?.["more positive"] || "",
        actionable_ai_suggestion: aiSuggestions?.["more actionable"] || "",
      };

      // Submit to Supabase
      const { error } = await supabase.from("feedback").insert({
        project_id: projectId,
        mentor_id: mentorId,
        mentor_name: mentorName,
        mentor_email: mentorEmail,
        feedback_text: feedback,
      });

      if (error) throw error;

      // Log to Magic Loop API
      await logFeedbackToMagicLoop(feedbackData);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("There was an error submitting your feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem("originalFeedback"); // Clear the original feedback from local storage
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const mentorId = localStorage.getItem("mentorId");
    const mentorName = localStorage.getItem("mentorName");
    const mentorEmail = localStorage.getItem("mentorEmail");

    if (!mentorId || !mentorName || !mentorEmail) {
      setIsModalOpen(true);
      setIsSubmitting(false);
      return;
    }

    await submitFeedback(mentorId, mentorName, mentorEmail);
  };

  const handleModalClose = (mentorInfo?: {
    id: string;
    name: string;
    email: string;
  }) => {
    setIsModalOpen(false);
    if (mentorInfo) {
      submitFeedback(mentorInfo.id, mentorInfo.name, mentorInfo.email);
    }
  };

  const handleSuggestionUse = (suggestion: string) => {
    setFeedback(suggestion);
    setShowSubmitButton(true);
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

  if (isSubmitted) {
    return <SubmissionConfirmation projectName={projectName} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white backdrop-blur-md border-blue-200/20 shadow-lg rounded-lg ">
        {/* Project Details */}
        <CardHeader className="border-b border-blue-200 pb-4">
          <CardTitle className="text-blue-900 text-2xl font-semibold">{projectName}</CardTitle>
          <CardDescription className="text-black text-md">{projectDescription}</CardDescription>
          <CardDescription className="text-black text-sm">
            <strong>Lead Name:</strong> {projectLeadName}
          </CardDescription>
          <CardDescription className="text-black text-sm">
            <strong>Lead Email:</strong> {projectLeadEmail}
          </CardDescription>
        </CardHeader>

        {/* Feedback Section */}
        <CardContent className="space-y-6 mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <label htmlFor="feedback" className="block text-sm font-medium text-blue-900 mb-2">
                Leave Your Feedback
              </label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback here"
                required
                className="min-h-[100px] bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-md p-2"
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
                    {/* <SparklesCore className="mr-2 h-4 w-4" /> */}
                    <Bot/>
                    Improve Feedback with AI
                  </>
                )}
              </Button>
            )}

            {/* AI Suggestions */}
            {aiSuggestions && (
              <Card className="bg-blue-50 border-blue-200 mt-4 p-4 rounded-lg">
                <h3 className="text-blue-900 text-lg font-semibold mb-4">AI Suggestions:</h3>
                <ul className="space-y-4">
                  {Object.entries(aiSuggestions).map(([category, suggestion]) => (
                    <li key={category} className="flex items-center justify-between">
                      <div>
                        <strong className="text-blue-900 capitalize">{category.replace(/_/g, " ")}:</strong>
                        <p>{suggestion}</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => handleSuggestionUse(suggestion)}
                        className="bg-blue-900 text-white text-sm py-1 px-3 rounded-full"
                      >
                        Apply
                      </Button>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Final Feedback Submission Button */}
            {showSubmitButton && !isSubmitting && (
              <Button
                type="submit"
                className="w-full bg-green-700 hover:bg-green-900 text-white py-2 px-4 rounded-full shadow-lg mt-4"
              >
                Submit Feedback
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Mentor Registration Modal */}
      <MentorRegistrationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </motion.div>
  );
}
