import type React from "react";
import { HackathonHeader } from "@/components/hackathon-header";
import { HackathonNav } from "@/components/hackathon-nav";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventStatusBar } from "@/components/event-status-bar";
import { JoinEventButton } from "@/components/join-event-button";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function HackathonLayout({
  children,
  params,
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

  // Check if user has joined
  const {
    data: { session },
  } = await supabase.auth.getSession();
  let hasJoined = false;

  if (session) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select()
      .eq("uid", session.user.id)
      .maybeSingle();

    if (profile) {
      const events = profile.events || [];
      hasJoined = events.includes(id);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col">
        <div>
          <HackathonHeader name={event.event_name} />
        </div>
        <EventStatusBar eventId={id} />
      </div>
      {!hasJoined && (
        <div className="bg-white">
          <div className="container mx-auto py-2 px-6 flex justify-end">
            <JoinEventButton eventId={id} eventName={event.event_name} />
          </div>
        </div>
      )}
      <HackathonNav id={id} />
      <main className="container mx-auto px-2 md:px-4 bg-gray-50">
        <div className="py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
