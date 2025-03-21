import React from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProjectBoardContext } from "./ProjectBoardContext.enum";

interface Project {
  id: string;
  project_name: string;
  project_description: string;
  lead_name: string;
  lead_email: string;
  teammates?: string[];
  event_id: string;
  created_at: string;
  project_url?: string;
  additional_materials_url?: string;
  cover_image_url?: string;
}

type ProjectBoardProps = {
  isLoading: boolean;
  projectList: Project[];
  session?: Session | null;
  projectBoardContext: ProjectBoardContext;
};

const ProjectBoard = ({
  isLoading,
  projectList,
  session,
  projectBoardContext,
}: ProjectBoardProps) => {
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
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projectList.map((project) => (
              <Card key={project.id} className="overflow-hidden shadow-lg">
                {/* Cover Image */}
                <div
                  className="h-48 w-full bg-gray-200"
                  style={
                    project.cover_image_url
                      ? {
                          backgroundImage: `url(${project.cover_image_url})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                      : {}
                  }
                />
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">
                      {project.project_name}
                    </CardTitle>

                    {/* Display this span if in MyProjects to distinguish between Owner or Team Member */}
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
                  <CardDescription className="text-gray-600 text-sm">
                    {project.project_description.length > 100
                      ? project.project_description.slice(0, 100) + "..."
                      : project.project_description}
                  </CardDescription>

                  {(() => {
                    switch (projectBoardContext) {
                      case ProjectBoardContext.MyProjects:
                        return (
                          <Link
                            href={`/my-project-gallery/${project.id}/dashboard`}
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
                            href={`/public-project-details/${project.id}`}
                            target="_blank"
                          >
                            <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                              View Details
                            </Button>
                          </Link>
                        );
                    }
                  })()}
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ProjectBoard;
