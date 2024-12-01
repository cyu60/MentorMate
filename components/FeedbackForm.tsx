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

interface AISuggestions {
  "more specific": string;
  "more actionable": string;
  "more positive": string;
}

interface FeedbackData {
  project_id: string;
  project_name: string;
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
}: {
  projectId: string;
  projectName: string;
  projectDescription: string;
}) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(
    null
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [hasImprovedWithAI, setHasImprovedWithAI] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);

  const improveWithAI = async () => {
    if (hasImprovedWithAI) return;
    setIsGeneratingAI(true);

    // Save the original feedback to local storage
    localStorage.setItem("originalFeedback", feedback);

    try {
      const url =
        "https://magicloops.dev/api/loop/b59e7eb1-4d27-4fa7-8411-543646f3ee2f/run";
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
    const url =
      "https://magicloops.dev/api/loop/d72bea64-246a-4c95-98d1-d7a9b90da991/run";
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

      const feedbackData = {
        project_id: projectId,
        project_name: projectName,
        project_description: projectDescription,
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
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="feedback"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Your Feedback for {projectName}
          </label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback here"
            required
            className="min-h-[100px]"
          />
        </div>
        {!hasImprovedWithAI && (
          <Button
            type="button"
            onClick={improveWithAI}
            disabled={isGeneratingAI || feedback.length === 0}
            className="w-full"
          >
            {isGeneratingAI ? "Improving..." : "Improve Feedback with AI"}
          </Button>
        )}
        {aiSuggestions && (
          <Card>
            <CardHeader>
              <CardTitle>AI-Enhanced Feedback Suggestions</CardTitle>
              <CardDescription>
                Consider these improvements for your feedback:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(aiSuggestions).map(([key, value]) => (
                <div key={key}>
                  <h3 className="font-semibold capitalize">{key}:</h3>
                  <p>{value}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionUse(value)}
                    className="mt-2"
                  >
                    Use this suggestion
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {showSubmitButton && (
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        )}
      </form>
      <MentorRegistrationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </>
  );
}
