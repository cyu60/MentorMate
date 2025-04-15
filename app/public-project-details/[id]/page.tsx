"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import QRCode from "react-qr-code";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import { Download, ExternalLink, ChevronDown, Users } from "lucide-react";
import { fetchProjectById } from "@/lib/helpers/projects";
import {
  Project,
  EventRole,
  ScoringCriterion,
  ScoreFormData,
} from "@/lib/types";
import { useEventRegistration } from "@/components/event-registration-provider";
import { EventRegistrationProvider } from "@/components/event-registration-provider";
import { ProjectScoringForm } from "@/components/scoring/project-scoring-form";
import { supabase } from "@/lib/supabase";
import { defaultCriteria } from "@/lib/constants";

function ProjectPageContent(): JSX.Element {
  const { id: projectId } = useParams();
  const [projectData, setProjectData] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackOpen, setFeedbackOpen] = useState(true);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(defaultCriteria);
  const [existingScore, setExistingScore] = useState<ScoreFormData | undefined>(
    undefined
  );
  const { userRole } = useEventRegistration();
  const [scoringOpen, setScoringOpen] = useState(true);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch project data
        const project = await fetchProjectById(projectId as string);
        if (!project) {
          notFound();
        }
        setProjectData(project);

        // Fetch event scoring config
        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .select("scoring_config")
          .eq("event_id", project.event_id)
          .single();

        if (eventError) {
          console.error("Error fetching event scoring config:", eventError);
        } else if (eventData?.scoring_config?.criteria) {
          setCriteria(eventData.scoring_config.criteria);
        }

        // If user is a judge, fetch their existing score for this project
        if (userRole === EventRole.Judge || userRole === EventRole.Admin) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session) {
            const { data: scoreData } = await supabase
              .from("project_scores")
              .select("*")
              .eq("project_id", projectId)
              .eq("judge_id", session.user.id)
              .single();

            if (scoreData) {
              setExistingScore(scoreData);
            }
          }
        }
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [projectId, userRole]);

  const handleCopyQR = async () => {
    try {
      const svg = document.querySelector("#project-qr-code");
      if (!svg) throw new Error("QR Code SVG not found");

      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = svgUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
      });

      // Get the project URL that the QR code represents
      const projectUrl = `${window.location.origin}/public-project-details/${projectId}`;

      // Try modern clipboard API first
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
      } catch (clipboardError) {
        console.error("Error copying QR Code:", clipboardError);
        // Fallback for mobile: copy the URL instead
        await navigator.clipboard.writeText(projectUrl);
        toast({
          title: "Copied Project URL",
          description:
            "QR code image copying not supported on this device. Project URL copied instead.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "QR Code copied to clipboard",
      });
    } catch (error) {
      console.error("Error copying QR Code:", error);
      toast({
        title: "Error",
        description: "Failed to copy QR Code",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQR = async () => {
    try {
      const svg = document.querySelector("#project-qr-code");
      if (!svg) throw new Error("QR Code SVG not found");

      const canvas = document.createElement("canvas");
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.src = svgUrl;

      await new Promise((resolve) => {
        img.onload = () => {
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          URL.revokeObjectURL(svgUrl);
          resolve(null);
        };
      });

      const sanitizedProjectName = projectData?.project_name
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const link = document.createElement("a");
      link.download = `${sanitizedProjectName}-qr-code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error downloading QR Code:", error);
      toast({
        title: "Error",
        description: "Failed to download QR Code",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Loading project data...
          </p>
        </div>
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Project not found.
          </p>
        </div>
      </div>
    );
  }

  const fullUrl = `${window.location.origin}/public-project-details/${projectId}`;

  return (
    <div className="min-h-screen bg-blue-50">
      <Toaster />
      <Navbar />

      {/* Hero Section */}
      <div className="pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-center mb-8">
            <span className="bg-clip-text text-transparent bg-black">
              {projectData.project_name}
            </span>
          </h1>

          {/* Project Cover Image */}
          {projectData.cover_image_url ? (
            <div
              className="w-full h-[250px] rounded-lg shadow-xl bg-cover bg-center mb-6"
              style={{
                backgroundImage: `url(${projectData.cover_image_url})`,
              }}
            />
          ) : (
            <div className="w-full h-[250px] bg-gradient-to-r from-blue-900 to-indigo-800 rounded-lg shadow-xl mb-6" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: Project Description */}
          <div className="flex-1 space-y-8">
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">
                {projectData.project_description}
              </p>
            </section>

            {/* Scoring Section for Judges */}
            {(userRole === EventRole.Judge || userRole === EventRole.Admin) && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <Button
                  variant="ghost"
                  className="w-full p-4 flex items-center justify-between text-lg font-semibold text-blue-900"
                  onClick={() => setScoringOpen(!scoringOpen)}
                >
                  <span>Project Scoring</span>
                  <ChevronDown
                    className={`h-5 w-5 text-blue-900 transition-transform duration-200 ${
                      scoringOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
                {scoringOpen && (
                  <div className="p-6 border-t">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">
                        Track Selection
                      </h3>
                      <select
                        value={selectedTrackId}
                        onChange={(e) => setSelectedTrackId(e.target.value)}
                        className="w-full p-2 border rounded-md mb-4"
                      >
                        <option value="">Select a track</option>
                        {projectData?.track_ids?.map((trackId) => (
                          <option key={trackId} value={trackId}>
                            {trackId}
                          </option>
                        ))}
                      </select>
                      {!selectedTrackId && (
                        <p className="text-sm text-red-500 mb-4">
                          Please select a track to start scoring
                        </p>
                      )}
                      {selectedTrackId && (
                        <>
                          <h3 className="text-lg font-semibold mb-3">
                            Scoring Criteria
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2">
                            {criteria.map((criterion) => (
                              <div
                                key={criterion.id}
                                className="p-4 bg-gray-50 rounded-lg"
                              >
                                <h4 className="font-medium">
                                  {criterion.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {criterion.description}
                                </p>
                                {criterion.weight && criterion.weight !== 1 && (
                                  <p className="text-sm text-blue-600 mt-1">
                                    Weight: {criterion.weight}x
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                          <ProjectScoringForm
                            projectId={projectId as string}
                            trackId={selectedTrackId}
                            criteria={criteria}
                            existingScore={existingScore}
                            onScoreSubmitted={() => {
                              toast({
                                title: "Success",
                                description: "Score submitted successfully",
                              });
                            }}
                          />
                        </>
                      )}
                    </div>
                    <ProjectScoringForm
                      projectId={projectId as string}
                      criteria={criteria}
                      existingScore={existingScore}
                      trackId={projectData.track_ids[0]}
                      onScoreSubmitted={() => {
                        toast({
                          title: "Success",
                          description: "Score submitted successfully",
                        });
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Feedback Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <Button
                variant="ghost"
                className="w-full p-4 flex items-center justify-between text-lg font-semibold text-blue-900"
                onClick={() => setFeedbackOpen(!feedbackOpen)}
              >
                <span>Provide Feedback</span>
                <ChevronDown
                  className={`h-5 w-5 text-blue-900 transition-transform duration-200 ${
                    feedbackOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>
              {feedbackOpen && (
                <div className="p-6 border-t">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Share Your Thoughts
                    </h3>
                    <p className="text-gray-700">
                      Your feedback helps the project team improve and refine
                      their work.
                    </p>
                    <FeedbackForm
                      projectId={projectData.id}
                      projectName={projectData.project_name}
                      projectDescription={projectData.project_description}
                      projectLeadEmail={projectData.lead_email}
                      projectLeadName={projectData.lead_name}
                      project_url={projectData.project_url}
                      additional_materials_url={
                        projectData.additional_materials_url
                      }
                      eventId={projectData.event_id}
                      noBorder={true}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Team Info, Resources & QR Code */}
          <aside className="w-full md:w-80 space-y-6">
            {/* Team Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Created by
              </h3>
              <p className="text-gray-700 mb-2">
                <span className="font-medium">Lead:</span>{" "}
                {projectData.lead_name}
              </p>
              {projectData.teammates && projectData.teammates.length > 0 && (
                <div className="mt-2">
                  <span className="font-medium">Team Members:</span>
                  <ul className="list-disc list-inside text-gray-700 ml-2 mt-1">
                    {projectData.teammates.map((teammate: string) => (
                      <li key={teammate}>{teammate}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Project Resources */}
            {(projectData.project_url ||
              projectData.additional_materials_url) && (
              <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Project Resources
                </h3>
                {projectData.project_url && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                    <a
                      href={projectData.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      View Project Repository
                    </a>
                  </div>
                )}
                {projectData.additional_materials_url && (
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-gray-600" />
                    <a
                      href={projectData.additional_materials_url}
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

            {/* QR Code */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Share Project
              </h3>
              <div className="flex flex-col items-center">
                <QRCode value={fullUrl} size={200} id="project-qr-code" />
                <Button
                  onClick={handleCopyQR}
                  className="mt-4 w-full button-gradient text-white"
                >
                  Copy QR Code
                </Button>
                <Button
                  onClick={handleDownloadQR}
                  className="mt-4 w-full button-gradient text-white"
                >
                  Download QR Code
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function PublicProjectPage() {
  const { id: projectId } = useParams();
  const [eventId, setEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventId = async () => {
      if (!projectId) return;

      try {
        const project = await fetchProjectById(projectId as string);
        if (project) {
          setEventId(project.event_id);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventId();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-blue-50">
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-2xl text-blue-100 font-light">
            Project not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EventRegistrationProvider eventId={eventId}>
      <ProjectPageContent />
    </EventRegistrationProvider>
  );
}
