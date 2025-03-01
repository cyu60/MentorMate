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
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-col w-full">
        <div className="w-full">
          <HackathonHeader name={event.event_name} />
        </div>
        <EventStatusBar eventId={id} />
      </div>
      {!hasJoined && (
        <div className="bg-white border-b w-full">
          <div className="w-full pr-4 sm:pr-6 flex justify-end">
            <JoinEventButton eventId={id} eventName={event.event_name} />
          </div>
        </div>
      )}
      <div className="w-full">
        <HackathonNav id={id} />
      </div>
      <main className="bg-gray-50 w-full -pl-4">
        <div className="w-full py-6">{children}</div>
      </main>
    </div>
  );
}
