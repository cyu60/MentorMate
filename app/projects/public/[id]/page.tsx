"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  ExternalLink,
  ArrowLeft,
  MessageSquare,
  QrCode,
  Copy,
  Scale,
} from "lucide-react";
import FeedbackDisplay from "@/features/projects/components/feedback/FeedbackDisplay";
import FeedbackForm from "@/features/projects/components/feedback/FeedbackForm";
import { QRCodeSection } from "@/features/projects/components/management/project-dashboard/components/QRCodeSection";
import { useQRCodeActions } from "@/features/projects/components/management/project-dashboard/hooks/useQRCodeActions";
import { toast } from "@/lib/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { ProjectScoringForm } from "@/components/project-scoring/project-scoring-form";
import { EventTrack, TrackScoringConfig } from "@/lib/types";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  teammates: string[];
  project_url: string | null;
  additional_materials_url: string | null;
  cover_image_url: string | null;
  created_at: string;
  event_id: string;
}

export default function PublicProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJudge, setIsJudge] = useState(false);
  const [isCheckingJudgeStatus, setIsCheckingJudgeStatus] = useState(false);
  const [projectTracks, setProjectTracks] = useState<EventTrack[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string>("");

  // QR Code functionality
  const { handleCopyQR, handleDownloadQR } = useQRCodeActions(
    project?.event_id || "",
    projectId,
    project?.project_name
  );

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
      } else {
        setProject(data);
      }
      setIsLoading(false);
    };

    fetchProject();
  }, [projectId]);

  // Check if user is a judge for this event
  useEffect(() => {
    const checkJudgeStatus = async () => {
      if (!project?.event_id) return;

      setIsCheckingJudgeStatus(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setIsJudge(false);
          setIsCheckingJudgeStatus(false);
          return;
        }

        const { data: roleData, error } = await supabase
          .from("user_event_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("event_id", project.event_id)
          .single();

        if (error) {
          console.error("Error checking judge status:", error);
          setIsJudge(false);
          setIsCheckingJudgeStatus(false);
          return;
        }

        const judgeStatus =
          roleData?.role === "judge" || roleData?.role === "admin";
        setIsJudge(judgeStatus);

        // Fetch project tracks if user is a judge
        if (judgeStatus && project?.id) {
          try {
            const { data: tracks, error: tracksError } = await supabase
              .from("project_tracks")
              .select(
                `
                track_id,
                event_tracks (
                  track_id,
                  event_id,
                  name,
                  description,
                  scoring_criteria
                )
              `
              )
              .eq("project_id", project.id)
              .overrideTypes<
                {
                  track_id: string;
                  event_tracks: EventTrack;
                }[]
              >();

            if (tracksError) {
              console.error("Error fetching project tracks:", tracksError);
            } else {
              // Extract the event_tracks from the nested structure
              const extractedTracks: EventTrack[] = tracks.map(
                (track) => track.event_tracks
              );
              setProjectTracks(extractedTracks);

              // Set first track as default selection
              if (extractedTracks && extractedTracks.length > 0) {
                setSelectedTrackId(extractedTracks[0].track_id);
              }
            }
          } catch (tracksError) {
            console.error("Error fetching project tracks:", tracksError);
          }
        }
      } catch (error) {
        console.error("Error checking judge status:", error);
        setIsJudge(false);
      } finally {
        setIsCheckingJudgeStatus(false);
      }
    };

    checkJudgeStatus();
  }, [project?.event_id, project?.id]);

  // Effect to handle when projectTracks changes from empty to populated
  useEffect(() => {
    console.log("ProjectTracks state changed:", projectTracks);
    if (projectTracks.length > 0 && !selectedTrackId) {
      setSelectedTrackId(projectTracks[0].track_id);
    }
  }, [projectTracks, selectedTrackId]);

  const handleScoreSubmitted = () => {
    toast({
      title: "Score Submitted",
      description: "Your score has been successfully submitted.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project not found</h1>
          <p className="text-gray-600 mb-4">
            This project may be private or no longer exists.
          </p>
          <Link href="/projects">
            <Button>Browse Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalMembers = (project.teammates?.length || 0) + 1;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  console.log("projectTracks", projectTracks);
  const selectedTrack = projectTracks.find(
    (track) => track.track_id === selectedTrackId
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <Badge variant="outline">Public Project</Badge>
          {isJudge && (
            <Badge variant="default" className="bg-purple-600">
              Judge View
            </Badge>
          )}
        </div>

        {/* Project Showcase */}
        <div className="max-w-4xl mx-auto">
          {/* Header Image */}
          <div className="w-full h-64 mb-8 rounded-lg overflow-hidden shadow-lg">
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url(${
                  project.cover_image_url || "/img/placeholder.png"
                })`,
              }}
            ></div>
          </div>

          {/* Project Information */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {project.project_name}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{totalMembers} team members</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live Project
                  </Button>
                </a>
              )}
              {project.additional_materials_url && (
                <a
                  href={project.additional_materials_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Additional Materials
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Project Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-lg leading-relaxed">
                {project.project_description}
              </p>
            </CardContent>
          </Card>

          {/* Team */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Meet the Team</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {project.lead_name}
                    </p>
                    <p className="text-sm text-gray-600">Project Lead</p>
                  </div>
                  <Badge>Lead</Badge>
                </div>

                {project.teammates?.map((teammate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{teammate}</p>
                      <p className="text-sm text-gray-600">Team Member</p>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Judge Scoring Section - Only visible to judges */}
          {isJudge && !isCheckingJudgeStatus && (
            <Card className="mb-8 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Scale className="h-5 w-5" />
                  Judge Scoring (Private)
                </CardTitle>
                <p className="text-sm text-purple-700">
                  This section is only visible to judges and administrators. Use
                  this form to score the project based on the track criteria.
                  Your feedback as a judge will not be visible to the public.
                </p>
              </CardHeader>
              <CardContent className="bg-white rounded-lg border border-purple-200">
                {projectTracks.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-2">
                      This project is not assigned to any tracks yet.
                    </p>
                    <p className="text-sm text-gray-500">
                      Contact the event organizer to assign this project to a
                      track before scoring.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Track Selection */}
                    {projectTracks.length > 1 && (
                      <div className="space-y-2 mt-4">
                        <label className="text-sm font-medium text-gray-700">
                          Select Track to Score:
                        </label>
                        <select
                          value={selectedTrackId}
                          onChange={(e) => setSelectedTrackId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
                        >
                          {projectTracks.map((track) => (
                            <option key={track.track_id} value={track.track_id}>
                              {track.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Track Info */}
                    {selectedTrack && (
                      <div className="p-4 bg-blue-50 rounded-lg mt-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {selectedTrack.name}
                        </h4>
                        {selectedTrack.description && (
                          <p className="text-sm text-gray-600">
                            {selectedTrack.description}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Scoring Form */}
                    {selectedTrack && selectedTrack.scoring_criteria ? (
                      <ProjectScoringForm
                        projectId={project.id}
                        trackId={selectedTrackId}
                        criteria={
                          (selectedTrack.scoring_criteria as TrackScoringConfig)
                            .criteria
                        }
                        onScoreSubmitted={handleScoreSubmitted}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-yellow-600 mb-2">
                          Scoring criteria not configured for this track.
                        </p>
                        <p className="text-sm text-gray-500">
                          Contact the event organizer to set up scoring
                          criteria.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Feedback Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Project Feedback
              </CardTitle>
              <p className="text-sm text-gray-600">
                See what mentors and peers have said about this project.
              </p>
            </CardHeader>
            <CardContent>
              <FeedbackDisplay projectId={project.id} showTitle={false} />
            </CardContent>
          </Card>

          {/* Submit Feedback Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Share Your Feedback
              </CardTitle>
              <p className="text-sm text-gray-600">
                Help this project improve by sharing your thoughts, suggestions,
                and ideas.
              </p>
            </CardHeader>
            <CardContent>
              <FeedbackForm
                projectId={project.id}
                projectName={project.project_name}
                projectDescription={project.project_description}
                projectLeadEmail={project.lead_email}
                projectLeadName={project.lead_name}
                project_url={project.project_url}
                additional_materials_url={project.additional_materials_url}
                eventId={project.event_id}
                noBorder={true}
                showMetadata={false}
              />
            </CardContent>
          </Card>

          {/* QR Code Sharing Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Share This Project
              </CardTitle>
              <p className="text-sm text-gray-600">
                Share this project with others using the QR code or direct link.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex flex-col items-center md:w-64">
                  <QRCodeSection
                    fullUrl={currentUrl}
                    onCopyQR={handleCopyQR}
                    onDownloadQR={handleDownloadQR}
                  />
                </div>

                <div className="flex-1 md:flex-2">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Direct Link:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentUrl}
                          readOnly
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(currentUrl);
                            toast({
                              title: "Copied!",
                              description: "Project URL copied to clipboard",
                            });
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h5 className="font-medium text-green-900 mb-2">
                        🚀 Share & Get Feedback:
                      </h5>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>
                          • Use this QR code or link to share your project with
                          mentors, peers, or anyone who can provide valuable
                          feedback
                        </p>
                        <p>
                          • Perfect for networking events, presentations, or
                          social media sharing
                        </p>
                        <p>
                          • Scan with any smartphone camera - no special app
                          required
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">
                        💡 Sharing Tips:
                      </h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Save the QR code image to share digitally</p>
                        <p>• Print it on business cards or project handouts</p>
                        <p>• Include it in your portfolio or resume</p>
                        <p>• Add it to your LinkedIn or GitHub profile</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="bg-blue-900 text-white">
            <CardContent className="text-center py-8">
              <h3 className="text-2xl font-bold mb-4">
                Interested in Similar Projects?
              </h3>
              <p className="text-blue-100 mb-6">
                Join our community to discover more innovative projects and
                connect with creators.
              </p>
              <Link href="/events">
                <Button variant="secondary" size="lg">
                  Explore Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
