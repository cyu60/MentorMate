import React from 'react'

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Session } from "@supabase/supabase-js";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { ProjectBoardContext } from './ProjectBoardContext.enum';

interface Project {
    id: string;
    project_name: string;
    lead_name: string;
    lead_email: string;
    project_description: string;
    created_at: string;
    teammates: string[];
    project_url?: string;
    additional_materials_url?: string;
    cover_image_url?: string;
  }


type ProjectBoardProps  = {
    isLoading: boolean,
    projectList: Project[],
    session: Session,

    /*
        This dictates the 'enviornment' the project board is being used in, e.g. being used in the 'my projects' page
            versus an event gallery.
    */
    projectBoardContext: ProjectBoardContext
};

const ProjectBoard = ( {isLoading, projectList, session, projectBoardContext}: ProjectBoardProps ) => {
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
                        projectList.map((projectList) => (
                            <Card key={projectList.id} className="overflow-hidden shadow-lg">
                                {/* Cover Image */}
                                <div 
                                    className="h-48 w-full bg-gray-200"
                                    style={
                                        projectList.cover_image_url
                                        ? {
                                            backgroundImage: `url(${projectList.cover_image_url})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }
                                        : {}
                                    }
                                />
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-xl font-semibold">
                                            {projectList.project_name}
                                        </CardTitle>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                            {projectList.lead_email === session?.user?.email ? "Owner" : "Team Member"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Lead: {projectList.lead_name}
                                    </p>
                                    <CardDescription className="text-gray-600 text-sm">
                                        {projectList.project_description.length > 100
                                            ? projectList.project_description.slice(0, 100) + "..."
                                            : projectList.project_description}
                                    </CardDescription>
                                    <Link href={`/my-projects/${projectList.id}/dashboard`} className="block">
                                        <Button className="w-full button-gradient text-white font-semibold py-2 px-4 rounded-full shadow hover:shadow-xl transition-all duration-300">
                                            View Project
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <>
                            {(() => {
                                switch (projectBoardContext) {
                                    case ProjectBoardContext.MyProjects:
                                        return (
                                            <div className="flex flex-col items-center justify-center mt-12">
                                                <h3 className="text-xl font-semibold text-gray-700">No Projects Found</h3>
                                                <p className="text-gray-500 mt-2">
                                                    You are not currently part of any projects.
                                                </p>
                                            </div>
                                        );
                                    case ProjectBoardContext.EventGallery:
                                        return (
                                            <div className="flex flex-col items-center justify-center space-y-4 mt-12">
                                                <div className="text-center space-y-3">
                                                    <h3 className="text-xl font-semibold text-gray-700">No Projects Found</h3>
                                                    <p className="text-gray-500 max-w-sm">
                                                        Try adjusting your search criteria or be the first to submit a project!
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
    )
}

export default ProjectBoard;