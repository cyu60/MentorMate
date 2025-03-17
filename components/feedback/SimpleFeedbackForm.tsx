"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Loader2, Bot, Mic, MicOff } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { SubmissionConfirmation } from "@/components/projects/SubmissionConfirmation";
import { Card } from "@/components/ui/card";

interface FeedbackFormProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectLeadEmail: string;
  projectLeadName: string;
  project_url?: string | null;
  additional_materials_url?: string | null;
  eventId: string;
  noBorder?: boolean;
}

export default function SimpleFeedbackForm({
  projectId,
  projectName,
  projectDescription,
  projectLeadEmail,
  projectLeadName,
  project_url,
  additional_materials_url,
  eventId,
  noBorder = false,
}: FeedbackFormProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [hasImprovedWithAI, setHasImprovedWithAI] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(
    new Set(["original"])
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor = (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const lastResult = event.results[event.results.length - 1];
          const transcript = lastResult[0].transcript;

          if (lastResult.isFinal) {
            setFeedback((prev) => {
              const newText = transcript.trim();
              return prev ? `${prev} ${newText}` : newText;
            });
            setCurrentTranscript("");
          } else {
            setCurrentTranscript(transcript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setCurrentTranscript("");
        };

        recognition.onerror = (event: { error: string }) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          setCurrentTranscript("");
        };

        setRecognition(recognition);
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession } }) => {
        setSession(currentSession);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const improveWithAI = async () => {
    if (hasImprovedWithAI) return;
    setIsGeneratingAI(true);

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

  const submitFeedback = async () => {
    try {
      const originalFeedback = localStorage.getItem("originalFeedback") || feedback;

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .single();

      if (projectError) throw projectError;

      const { error } = await supabase.from("feedback").insert([
        {
          project_id: projectData.id,
          mentor_id: session?.user?.id || null,
          mentor_name: session?.user?.user_metadata?.full_name || null,
          mentor_email: session?.user?.email || null,
          feedback_text: feedback,
          original_feedback_text: originalFeedback,
          modifier_field: Array.from(usedSuggestions),
          specific_ai_suggestion: aiSuggestions?.["more specific"] || "",
          positive_ai_suggestion: aiSuggestions?.["more positive"] || "",
          actionable_ai_suggestion: aiSuggestions?.["more actionable"] || "",
          event_id: eventId,
        },
      ]);

      if (error) throw error;

      // Send email notification
      const emailResponse = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "feedback",
          to: projectLeadEmail,
          projectName: projectName,
          mentorName: session?.user?.user_metadata?.full_name || null,
          feedback: feedback,
          projectId: projectId,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send feedback notification email");
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(
        `Error submitting feedback: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
      localStorage.removeItem("originalFeedback");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitFeedback();
  };

  if (isSubmitted) {
    return <SubmissionConfirmation projectName={projectName} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto"
    >
      <div
        className={`max-w-5xl mx-auto bg-white ${
          noBorder ? "" : "shadow-lg"
        } rounded-lg`}
      >
        {!session && (
          <div
            className={`bg-blue-50 ${
              noBorder ? "" : "border border-blue-100"
            } rounded-lg p-2 mx-4 flex items-center justify-between`}
          >
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <LogIn className="w-4 h-4" />
              <span>
                Sign in to save progress and communicate with project members
              </span>
            </div>
            <Link
              href="/select"
              className="text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.setItem("returnUrl", window.location.pathname);
                }
              }}
            >
              Sign in →
            </Link>
          </div>
        )}

        <div className="space-y-4 p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-6 text-gray-800">
              <h3 className="font-medium text-md mb-3">
                Consider in your feedback:
              </h3>
              <ul className="list-decimal pl-6 space-y-2 text-sm">
                <li>What should they do next to improve the project?</li>
                <li>What could be better or work differently?</li>
                <li>
                  What works well, and are there similar projects to learn from?
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-blue-900"
                >
                  Leave Your Feedback
                </label>
                <Button
                  type="button"
                  onClick={toggleListening}
                  className={`mt-2 sm:mt-0 self-start sm:self-auto p-2 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2 z-10 shadow-sm border border-blue-100 ${
                    isListening ? "bg-blue-100" : "bg-blue-50"
                  }`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  <span className="text-sm">
                    {isListening ? (
                      <span className="text-red-500 animate-pulse">
                        Listening...
                      </span>
                    ) : (
                      <span className="text-blue-500">Voice input</span>
                    )}
                  </span>
                  {isListening ? (
                    <MicOff className="h-5 w-5 text-red-500" />
                  ) : (
                    <Mic className="h-5 w-5 text-blue-500" />
                  )}
                </Button>
              </div>
              <div className="relative">
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
              {currentTranscript && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  Processing: {currentTranscript}
                </div>
              )}
            </div>

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

            {aiSuggestions && (
              <Card className="bg-blue-50 border-blue-200 mt-4 p-4 rounded-lg">
                <h3 className="text-blue-900 text-lg font-semibold mb-4">
                  AI Suggestions:
                </h3>
                <ul className="space-y-6">
                  {Object.entries(aiSuggestions).map(([category, suggestion]) => (
                    <li key={category} className="flex flex-col space-y-2">
                      <div>
                        <strong className="text-blue-900 capitalize">
                          {category.replace(/_/g, " ")}:
                        </strong>
                        <p className="mt-1">{suggestion as string}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => {
                            setFeedback(suggestion as string);
                            const newTags = new Set<string>();
                            const tagMap: { [key: string]: string } = {
                              "more specific": "more_specific",
                              "more positive": "more_positive",
                              "more actionable": "more_actionable",
                            };
                            const tagToAdd =
                              tagMap[category] || category.replace(/ /g, "_");
                            newTags.add(tagToAdd);
                            newTags.add("original");
                            setUsedSuggestions(newTags);
                          }}
                          className="bg-blue-900 text-white text-sm py-1 px-3 rounded-full"
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setFeedback(
                              (prev) => `${prev}\n\n${suggestion as string}`
                            );
                            const newTags = new Set(usedSuggestions);
                            const tagMap: { [key: string]: string } = {
                              "more specific": "more_specific",
                              "more positive": "more_positive",
                              "more actionable": "more_actionable",
                            };
                            const tagToAdd =
                              tagMap[category] || category.replace(/ /g, "_");
                            newTags.add(tagToAdd);
                            if (!newTags.has("original")) {
                              newTags.add("original");
                            }
                            setUsedSuggestions(newTags);
                          }}
                          className="bg-green-700 text-white text-sm py-1 px-3 rounded-full"
                        >
                          Add Below
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

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