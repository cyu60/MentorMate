"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HackathonNav } from "@/components/hackathon-nav";
import { EventStatusBar } from "@/components/event-status-bar";

const GoalSection = dynamic(() => import("@/components/goal-section"), {
  ssr: false,
});
const JournalSection = dynamic(() => import("@/components/journal-section"), {
  ssr: false,
});
const ProjectDashboardSection = dynamic(
  () => import("@/components/project-dashboard-section"),
  {
    ssr: false,
  }
);
const ToolsSection = dynamic(() => import("@/components/tools-section"), {
  ssr: false,
});

interface DashboardContentProps {
  eventId: string;
}

export default function DashboardContent({ eventId }: DashboardContentProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [event, setEvent] = useState<{ event_name: string; cover_image_url: string | null } | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("event_name, cover_image_url")
        .eq("event_id", eventId)
        .single();

      if (!error && data) {
        setEvent(data);
      }
    };

    const fetchProjectId = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("event_id", eventId)
        .single();

      if (!error && data) {
        setProjectId(data.id);
      }
    };

    fetchEventData();
    fetchProjectId();
  }, [eventId]);

  return (
    <div className="space-y-8">
      {event && (
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: event.cover_image_url
                ? `url(${event.cover_image_url})`
                : 'linear-gradient(to bottom right, #4F46E5, #3B82F6)',
            }}
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 h-full flex flex-col justify-center p-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {event.event_name}
            </h1>
            <HackathonNav id={eventId} />
          </div>
        </div>
      )}
      <EventStatusBar eventId={eventId} />
      <div className="space-y-6">
        <Suspense fallback={<div>Loading goals...</div>}>
          <GoalSection eventId={eventId} />
        </Suspense>
        <Suspense fallback={<div>Loading journal...</div>}>
          <JournalSection eventId={eventId} />
        </Suspense>
        <Suspense fallback={<div>Loading project...</div>}>
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
        </Suspense>
        <Suspense fallback={<div>Loading tools...</div>}>
          <ToolsSection />
        </Suspense>
      </div>
    </div>
  );
}
