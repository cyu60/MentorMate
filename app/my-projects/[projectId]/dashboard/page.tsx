"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ProjectDashboardSection from "@/components/project-dashboard-section";

export default function ProjectDashboard() {
  const { projectId } = useParams();

  return (
    <div>
      <Navbar />
      <div className="relative flex flex-col items-center justify-start min-h-screen overflow-hidden bg-gradient-to-b from-white to-blue-100/80 pb-10 pt-16">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-black">
              Project Dashboard
            </span>
          </h1>
        </div>

        <div className="w-full max-w-4xl px-4 sm:px-0 mb-6">
          <Link href="/my-projects">
            <Button className="button-gradient text-white font-semibold py-2 px-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 text-sm sm:text-base">
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back to My Projects</span>
            </Button>
          </Link>
        </div>

        <div className="w-full max-w-4xl">
          <ProjectDashboardSection projectId={projectId as string} eventId="" />
        </div>
      </div>
    </div>
  );
}
