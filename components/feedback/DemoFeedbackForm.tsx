"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/app/utils/supabase/client";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { SubmissionConfirmation } from "@/components/projects/SubmissionConfirmation";
import VoiceInput from "@/components/utils/VoiceInput";

interface DemoFeedbackFormProps {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectLeadEmail: string;
  projectLeadName: string;
  project_url?: string | null;
  additional_materials_url?: string | null;
  eventId: string;
  noBorder?: boolean;
  showMetadata?: boolean;
}

export default function DemoFeedbackForm({
  projectId,
  projectName,
  projectDescription,
  projectLeadEmail,
  projectLeadName,
  project_url,
  additional_materials_url,
  eventId,
  noBorder = false,
  showMetadata = false,
}: DemoFeedbackFormProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [supabaseClient] = useState(() => createClient());
  const [investDecision, setInvestDecision] = useState<"invest" | "dont_invest" | null>(null);

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

  const submitFeedback = async () => {
    try {
      console.log("Starting feedback submission");

      if (!investDecision) {
        alert("Please select whether you would invest or not invest in this project");
        setIsSubmitting(false);
        return;
      }

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

      const { data, error } = await supabaseClient.from("demo_feedback").insert([
        {
          project_id: projectData.id,
          mentor_id: session?.user?.id || null,
          mentor_name: session?.user?.user_metadata?.full_name || null,
          mentor_email: session?.user?.email || null,
          feedback_text: feedback,
          investment_decision: investDecision,
          event_id: eventId,
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

      console.log("Demo feedback submitted successfully:", data);

      // Send email notification
      const emailResponse = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "demo_feedback",
          to: projectLeadEmail,
          projectName: projectName,
          mentorName: session?.user?.user_metadata?.full_name || null,
          feedback: feedback,
          investDecision: investDecision,
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
      className="w-full mx-auto px-4"
    >
      <div
        className={`max-w-5xl mx-auto bg-white ${
          noBorder ? "" : "shadow-lg"
        } rounded-lg`}
      >
        {showMetadata && (
          <>
            <div className="p-4">
              <h2 className="text-blue-900 text-2xl font-semibold">
                {projectName}
              </h2>
              <p className="text-black text-md">{projectDescription}</p>
              <p className="text-black text-sm font-bold">Submitted by:</p>
              <div className="ml-4 space-y-1 mt-1">
                <p className="text-black text-sm">
                  <span className="font-bold text-gray-600">Name:</span>{" "}
                  <span className="text-gray-700">{projectLeadName}</span>
                </p>
                <p className="text-black text-sm">
                  <span className="font-bold text-gray-600">Email:</span>{" "}
                  <span className="text-gray-700">{projectLeadEmail}</span>
                </p>
              </div>
            </div>

            {(project_url || additional_materials_url) && (
              <div className="p-4 space-y-2">
                {project_url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                    <a
                      href={project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Project Repository
                    </a>
                  </div>
                )}
                {additional_materials_url && (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-gray-600" />
                    <a
                      href={additional_materials_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Download Project Materials
                    </a>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!session && (
          <div
            className={`bg-blue-50 ${
              noBorder ? "" : "border border-blue-100"
            } rounded-lg p-2 mx-4 flex items-center justify-between`}
          >
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <LogIn className="w-4 h-4" />
              <span>
                Sign in to save progress and provide investment feedback
              </span>
            </div>
            <Link
              href="/login"
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
              <h3 className="font-medium text-lg mb-3">
                Demo Day Feedback Form
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Please share your thoughts on this project and whether you would invest in it.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <label
                  htmlFor="feedback"
                  className="block text-sm font-medium text-blue-900"
                >
                  Feedback Comments
                </label>
                <VoiceInput setText={setFeedback} />
              </div>
              <div className="relative">
                <TextareaAutosize
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts on the project's strengths, weaknesses, and potential improvements..."
                  required
                  minRows={4}
                  className="w-full bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400 rounded-md p-2"
                />
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-blue-900 font-medium text-md mb-3">
                Investment Decision
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    investDecision === "invest" ? "border-green-500 border-2" : ""
                  }`}
                  onClick={() => setInvestDecision("invest")}
                >
                  <CardContent className="flex items-center p-4">
                    <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 ${
                      investDecision === "invest" ? "bg-green-500" : "bg-gray-200"
                    }`}>
                      {investDecision === "invest" && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-green-700">Invest</h4>
                      <p className="text-sm text-gray-600">I would invest in this project</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card 
                  className={`cursor-pointer hover:shadow-md transition-all ${
                    investDecision === "dont_invest" ? "border-red-500 border-2" : ""
                  }`}
                  onClick={() => setInvestDecision("dont_invest")}
                >
                  <CardContent className="flex items-center p-4">
                    <div className={`w-5 h-5 rounded-full mr-3 flex-shrink-0 ${
                      investDecision === "dont_invest" ? "bg-red-500" : "bg-gray-200"
                    }`}>
                      {investDecision === "dont_invest" && (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-lg text-red-700">Don&apos;t Invest</h4>
                      <p className="text-sm text-gray-600">I would not invest in this project</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !investDecision}
              className="w-full bg-blue-700 hover:bg-blue-900 text-white py-2 px-4 rounded-full shadow-lg mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
} 