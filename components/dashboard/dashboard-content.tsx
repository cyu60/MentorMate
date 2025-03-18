"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import { fetchProjectsByEventId } from "@/lib/helpers/projects";

const GoalSection = dynamic(() => import("@/components/journal/goal-section"), {
  ssr: false,
});
const JournalSection = dynamic(
  () => import("@/components/journal/journal-section"),
  {
    ssr: false,
  }
);
// const ProjectDashboardSection = dynamic(
//   () => import('@/components/projects/project-dashboard'),
//   {
//     ssr: false,
//   }
// );
// const ToolsSection = dynamic(() => import('@/components/utils/tools-section'), {
//   ssr: false,
// });

interface DashboardContentProps {
  eventId: string;
}

export default function DashboardContent({ eventId }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading goals...</div>}>
        <GoalSection eventId={eventId} />
      </Suspense>
      <Suspense fallback={<div>Loading journal...</div>}>
        <JournalSection eventId={eventId} />
      </Suspense>
      {/* <Suspense fallback={<div>Loading project...</div>}>
        {projectId ? (
          <ProjectDashboardSection eventId={eventId} projectId={projectId} />
        ) : (
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-700">
                No Project Yet
              </h3>
              <p className="text-gray-500 text-center">
                Get started by submitting your project!
              </p>
              <Link href={`/events/${eventId}/projects`}>
                <Button className="button-gradient text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  Submit Project
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </Suspense> */}
      {/* <Suspense fallback={<div>Loading tools...</div>}>
        <ToolsSection />
      </Suspense> */}
    </div>
  );
}
