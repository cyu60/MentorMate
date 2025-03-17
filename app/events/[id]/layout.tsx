import type React from "react";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventRegistrationWrapper } from "@/components/event-registration-wrapper";

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
    .select("event_name")
    .eq("event_id", id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <EventRegistrationWrapper eventId={id}>
        <main className="container mx-auto px-2 md:px-4 mt-16">
          {children}
        </main>
      </EventRegistrationWrapper>
    </div>
  );
}
