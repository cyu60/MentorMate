import type React from "react";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventRegistrationWrapper } from "@/components/event-registration-wrapper";
import { EventHeader } from "@/components/events/event-header";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

export default async function HackathonLayout({
  children,
  params,
}: LayoutProps) {
  const { id } = params;
  const supabase = createSupabaseClient();

  // Fetch event details
  const { data: event } = await supabase
    .from("events")
    .select(`
      event_id,
      event_name,
      event_date,
      location,
      event_description,
      cover_image_url
    `)
    .eq("event_id", id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex">
      <EventRegistrationWrapper eventId={id}>
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-4 space-y-4 w-full">
            <EventHeader
              eventName={event.event_name}
              coverImageUrl={event.cover_image_url}
              eventDate={event.event_date}
              location={event.location}
              description={event.event_description}
              eventId={id}
            />
            {children}
          </div>
        </main>
      </EventRegistrationWrapper>
    </div>
  );
}
