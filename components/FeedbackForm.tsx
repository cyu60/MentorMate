"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: { error: string }) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

import { createClient } from "@/app/utils/supabase/client";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Bot, Mic, MicOff } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { SubmissionConfirmation } from "./SubmissionConfirmation";
import { Footer } from "@/components/footer";

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
  modifier_field: string[];
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
  userName?: string;
  userEmail?: string;
}) {
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(
    null
  );
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [hasImprovedWithAI, setHasImprovedWithAI] = useState<boolean>(false);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseClient] = useState(() => createClient());
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set(['original']));
  
  // Log usedSuggestions changes
  useEffect(() => {
    console.log("usedSuggestions updated:", Array.from(usedSuggestions));
  }, [usedSuggestions]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      type SpeechRecognitionWindow = {
        SpeechRecognition?: new () => SpeechRecognition;
        webkitSpeechRecognition?: new () => SpeechRecognition;
      };

      const SpeechRecognitionConstructor = (
        (window as SpeechRecognitionWindow).SpeechRecognition ||
        (window as SpeechRecognitionWindow).webkitSpeechRecognition
      ) as new () => SpeechRecognition;

      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const lastResult = event.results[event.results.length - 1];
          const transcript = (lastResult[0] as SpeechRecognitionAlternative).transcript;
          
          if (lastResult.isFinal) {
            setFeedback(prev => {
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
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setCurrentTranscript("");
        };

        setRecognition(recognition);
      }
    }
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

  useEffect(() => {
    console.log("Initializing Supabase session");
    supabaseClient.auth
      .getSession()
      .then(
        ({
          data: { session: currentSession },
        }: {
          data: { session: Session | null };
        }) => {
          console.log("Got session:", currentSession);
          setSession(currentSession);
        }
      );

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        console.log("Auth state changed:", session);
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

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

  const submitFeedback = async () => {
    if (!session?.user) {
      console.error("No user session found");
      return;
    }

    if (!session.user.email) {
      alert(
        "Unable to submit feedback: Your account is missing an email address. Please log out and sign in again with a provider that includes your email (e.g., Google)."
      );
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Starting feedback submission with session:", session.user);
      const originalFeedback =
        localStorage.getItem("originalFeedback") || feedback;

      // Common words to filter out
      const commonWords = new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
        'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
        'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
        'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
        'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
        'project', 'could', 'can', 'just', 'should', 'now', 'work', 'like', 'any',
        'also', 'into', 'only', 'see', 'use', 'way', 'than', 'find', 'day', 'more',
        'your', 'such', 'make', 'want', 'look', 'these', 'know', 'because', 'good',
        'people', 'year', 'take', 'well', 'some', 'when', 'then', 'other', 'how',
        'our', 'two', 'more', 'time', 'very'
      ]);

      // Helper function to get significant words (excluding common words)
      const getSignificantWords = (text: string): string[] => {
        return text.toLowerCase()
          .split(/\s+/)
          .filter(word => !commonWords.has(word) && word.length > 2);
      };

      // Helper function to find consecutive matching words
      const findConsecutiveMatches = (source: string[], target: string[]): number => {
        let maxConsecutive = 0;
        let current = 0;
        
        for (let i = 0; i < source.length; i++) {
          for (let j = 0; j < target.length; j++) {
            current = 0;
            while (i + current < source.length &&
                   j + current < target.length &&
                   source[i + current] === target[j + current]) {
              current++;
            }
            maxConsecutive = Math.max(maxConsecutive, current);
          }
        }
        return maxConsecutive;
      };

      console.log("Starting tag validation with tags:", Array.from(usedSuggestions));
      
      // Validate tags based on content analysis
      const validatedTags = new Set<string>();
      const finalWords = getSignificantWords(feedback);
      
      // Validate each tag in usedSuggestions
      console.log("Analyzing final content:", feedback);
      console.log("Used suggestions before validation:", Array.from(usedSuggestions));
      console.log("Available AI suggestions:", aiSuggestions);
      for (const tag of usedSuggestions) {
        console.log("\nValidating tag:", tag);
        if (tag === 'original') {
          const originalWords = getSignificantWords(originalFeedback);
          const originalConsecutive = findConsecutiveMatches(originalWords, finalWords);
          const originalThreshold = 3;
          console.log("Validating original tag:", originalConsecutive, ">=", originalThreshold);
          if (originalConsecutive >= originalThreshold) {
            validatedTags.add('original');
          }
        } else if (tag === 'more_positive' && aiSuggestions?.["more positive"]) {
          const positiveWords = getSignificantWords(aiSuggestions["more positive"]);
          const positiveConsecutive = findConsecutiveMatches(positiveWords, finalWords);
          const positiveThreshold = 3;
          console.log("Validating more_positive tag:", positiveConsecutive, ">=", positiveThreshold);
          if (positiveConsecutive >= positiveThreshold) {
            validatedTags.add('more_positive');
          }
        } else if (tag === 'more_specific' && aiSuggestions?.["more specific"]) {
          const specificWords = getSignificantWords(aiSuggestions["more specific"]);
          const specificConsecutive = findConsecutiveMatches(specificWords, finalWords);
          const specificThreshold = 3;
          console.log("Validating more_specific tag:", specificConsecutive, ">=", specificThreshold);
          if (specificConsecutive >= specificThreshold) {
            validatedTags.add('more_specific');
          }
        }
      }

      // If no tags were validated, it's completely original
      if (validatedTags.size === 0) {
        validatedTags.add('original');
      }

      console.log("Final validated tags:", Array.from(validatedTags));
      const modifier_field = Array.from(validatedTags);
      console.log("Setting modifier_field to:", modifier_field);

      const feedbackData: FeedbackData = {
        project_id: projectId,
        project_name: projectName,
        project_description: projectDescription,
        project_email: projectLeadEmail,
        project_lead_name: projectLeadName,
        mentor_id: session.user.id,
        mentor_name: session.user.user_metadata?.full_name || "Unknown",
        mentor_email: session.user.email || "",
        original_feedback: originalFeedback,
        final_feedback: feedback,
        specific_ai_suggestion: aiSuggestions?.["more specific"] || "",
        positive_ai_suggestion: aiSuggestions?.["more positive"] || "",
        actionable_ai_suggestion: aiSuggestions?.["more actionable"] || "",
        modifier_field: Array.from(usedSuggestions)
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
      const { data, error } = await supabaseClient.from("feedback").insert([
        {
          project_id: projectData.id,
          mentor_id: session.user.id,
          mentor_name: session.user.user_metadata?.full_name || "Unknown",
          mentor_email: session.user.email,
          feedback_text: feedback,
          original_feedback_text: originalFeedback,
          modifier_field: Array.from(usedSuggestions),
          specific_ai_suggestion: aiSuggestions?.["more specific"] || "",
          positive_ai_suggestion: aiSuggestions?.["more positive"] || "",
          actionable_ai_suggestion: aiSuggestions?.["more actionable"] || ""
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        throw error;
      }

      console.log("Feedback submitted successfully:", data);

      // Send email notification
      const emailResponse = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'feedback',
          to: projectLeadEmail,
          projectName: projectName,
          mentorName: session.user.user_metadata?.full_name || "Unknown",
          feedback: feedback
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send feedback notification email');
      }

      // Log to Magic Loop API
      await logFeedbackToMagicLoop(feedbackData);

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
    if (!session?.user) {
      alert("Please log in to submit feedback.");
      return;
    }
    setIsSubmitting(true);
    await submitFeedback();
  };

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
      className="w-full mx-auto px-4"
    >
      {/* Project Details */}
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg">
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
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-blue-900 mb-2"
              >
                Leave Your Feedback
              </label>
              <div className="relative">
                <TextareaAutosize
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter your feedback here"
                  required
                  minRows={4}
                  className="w-full bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-md p-2 pr-32"
                />
                <Button
                  type="button"
                  onClick={toggleListening}
                  className={`absolute right-2 top-2 p-2 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2 z-10 shadow-sm border border-blue-100 ${
                    isListening ? 'bg-blue-100' : 'bg-blue-50'
                  }`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  <span className="text-sm">
                    {isListening ? (
                      <span className="text-red-500 animate-pulse">Listening...</span>
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
              {currentTranscript && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  Processing: {currentTranscript}
                </div>
              )}
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
                            onClick={() => {
                              console.log("Replace clicked for category:", category);
                              setFeedback(suggestion);
                              const newTags = new Set<string>();
                              console.log("Raw category:", category);
                              // Convert category to tag format
                              // Map category directly to tag name
                              const tagMap: { [key: string]: string } = {
                                "more specific": "more_specific",
                                "more positive": "more_positive",
                                "more actionable": "more_actionable"
                              };
                              const tagToAdd = tagMap[category] || category.replace(/ /g, "_");
                              console.log("Converted to tag:", tagToAdd);
                              console.log("Adding tag:", tagToAdd);
                              newTags.add(tagToAdd);
                              newTags.add('original');
                              console.log("Final tags:", Array.from(newTags));
                              setUsedSuggestions(newTags);
                            }}
                            className="bg-blue-900 text-white text-sm py-1 px-3 rounded-full"
                          >
                            Replace
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              console.log("Add Below clicked for category:", category);
                              setFeedback((prev) => `${prev}\n\n${suggestion}`);
                              // Create new Set from existing tags
                              const newTags = new Set(usedSuggestions);
                              console.log("Add Below: Starting with tags:", Array.from(newTags));
                              console.log("Raw category:", category);
                              // Convert category to tag format
                              // Map category directly to tag name
                              const tagMap: { [key: string]: string } = {
                                "more specific": "more_specific",
                                "more positive": "more_positive",
                                "more actionable": "more_actionable"
                              };
                              const tagToAdd = tagMap[category] || category.replace(/ /g, "_");
                              console.log("Converted to tag:", tagToAdd);
                              console.log("Current tags:", Array.from(newTags));
                              console.log("Adding tag:", tagToAdd);
                              newTags.add(tagToAdd);
                              if (!newTags.has('original')) {
                                newTags.add('original');
                              }
                              console.log("Final tags:", Array.from(newTags));
                              setUsedSuggestions(newTags);
                            }}
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
      <Footer />
    </motion.div>
  );
}
