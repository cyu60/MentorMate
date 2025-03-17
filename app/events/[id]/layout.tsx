import type React from "react";
import { HackathonHeader } from "@/components/hackathon-header";
import { HackathonNav } from "@/components/hackathon-nav";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventStatusBar } from "@/components/event-status-bar";
import { JoinEventButton } from "@/components/join-event-button";
import { EventRegistrationWrapper } from "@/components/event-registration-wrapper";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function HackathonLayout({
  children,
}: LayoutProps) {
  const { id } = await params;
  const supabase = createSupabaseClient();

  // Fetch event details
  const { data: event } = await supabase
    .from("events")
    .select("event_name")
    .eq("event_id", id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <EventRegistrationWrapper eventId={id}>
        <div className="flex flex-col">
          <div>
            <HackathonHeader name={event.event_name} />
          </div>
          <EventStatusBar eventId={id} />
        </div>
        <div className="bg-white">
          <div className="container mx-auto py-2 px-6 flex justify-end">
            <JoinEventButton eventId={id} eventName={event.event_name} />
          </div>
        </div>
        <HackathonNav id={id} />
        <main className="container mx-auto px-2 md:px-4 bg-gray-50">
          <div className="py-6">
            {children}
          </div>
        </main>
      </EventRegistrationWrapper>
    </div>
  );
}
