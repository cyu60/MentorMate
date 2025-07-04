import React, { useState } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, QrCode, MessageSquare, Copy } from "lucide-react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { toast } from "@/lib/hooks/use-toast";

import { Project, ProjectBoardContext } from "@/lib/types";

export interface ProjectBoardProps {
  isLoading: boolean;
  projectList: Project[];
  session?: import("@supabase/supabase-js").Session | null;
  projectBoardContext: ProjectBoardContext;
}

const ProjectBoard = ({
  isLoading,
  projectList,
  session,
  projectBoardContext,
}: ProjectBoardProps) => {
  const [showQRCodes, setShowQRCodes] = useState<{ [key: string]: boolean }>({});

  const toggleQRCode = (projectId: string) => {
    setShowQRCodes(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  const copyFeedbackUrl = (projectId: string) => {
    const feedbackUrl = `${window.location.origin}/projects/public/${projectId}`;
    navigator.clipboard.writeText(feedbackUrl);
    toast({
      title: "Copied!",
      description: "Feedback URL copied to clipboard",
    });
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto"
        >
          {projectList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projectList.map((project) => {
                const feedbackUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/projects/public/${project.id}`;
                
                return (
                  <Card key={project.id} className="overflow-hidden shadow-lg">
                    {/* Cover Image or Gradient Fallback */}
                    <div
                      className="h-48 w-full relative"
                      style={{
                        backgroundImage: `url(${project.cover_image_url || "/img/placeholder.png"})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {!project.cover_image_url && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <h3 className="text-white text-xl font-semibold text-center break-words">
                            {project.project_name}
                          </h3>
                        </div>
                      )}
                    </div>
                    <div className="p-6 space-y-4 flex flex-col">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold truncate">
                          {project.project_name}
                        </CardTitle>
                        {projectBoardContext === ProjectBoardContext.MyProjects && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {project.lead_email === session?.user?.email
                              ? "Owner"
                              : "Team Member"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Lead: {project.lead_name}
                      </p>
                      <CardDescription
                        className="text-gray-600 text-sm line-clamp-3 overflow-hidden min-h-[3.75rem]"
                      >
                        {project.project_description}
                      </CardDescription>

                      {/* QR Code Section */}
                      {showQRCodes[project.id] && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex flex-col items-center">
                            <div className="bg-white p-2 rounded border">
                              <QRCode value={feedbackUrl} size={120} />
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center">
                              Scan for feedback page
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyFeedbackUrl(project.id)}
                              className="mt-2 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy Link
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="mt-auto space-y-2">
                        {(() => {
                          switch (projectBoardContext) {
                            case ProjectBoardContext.MyProjects:
                              return (
                                <Link
                                  href={`/projects/${project.id}`}
                                  className="block"
                                >
                                  <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-xl transition-all duration-300">
                                    View Project
                                  </Button>
                                </Link>
                              );
                            case ProjectBoardContext.EventGallery:
                              return (
                                <Link
                                  href={`/projects/public/${project.id}`}
                                  target="_blank"
                                  className="block"
                                >
                                  <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                                    View Details
                                  </Button>
                                </Link>
                              );
                          }
                        })()}
                        
                        {/* QR Code and Feedback buttons for MyProjects context */}
                        {projectBoardContext === ProjectBoardContext.MyProjects && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleQRCode(project.id)}
                              className="flex-1 text-xs"
                            >
                              <QrCode className="h-3 w-3 mr-1" />
                              {showQRCodes[project.id] ? 'Hide QR' : 'Show QR'}
                            </Button>
                            <Link href={`/projects/public/${project.id}`} className="flex-1">
                              <Button variant="ghost" size="sm" className="w-full text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Feedback Page
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <>
              {(() => {
                switch (projectBoardContext) {
                  case ProjectBoardContext.MyProjects:
                    return (
                      <div className="flex flex-col items-center justify-center mt-12">
                        <h3 className="text-xl font-semibold text-gray-700">
                          No Projects Found
                        </h3>
                        <p className="text-gray-500 mt-2">
                          You are not currently part of any projects.
                        </p>
                      </div>
                    );
                  case ProjectBoardContext.EventGallery:
                    return (
                      <div className="flex flex-col items-center justify-center space-y-4 mt-12">
                        <div className="text-center space-y-3">
                          <h3 className="text-xl font-semibold text-gray-700">
                            No Projects Found
                          </h3>
                          <p className="text-gray-500 max-w-sm">
                            Try adjusting your search criteria or be the first
                            to submit a project!
                          </p>
                        </div>
                      </div>
                    );
                }
              })()}
            </>
          )}
        </motion.div>
      )}
    </>
  );
};

export default ProjectBoard;