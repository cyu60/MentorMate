import type React from "react";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventStatusBar } from "@/components/event-status-bar";

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

  return (
    <div className="min-h-screen">
      <div className="flex flex-col">
        <EventStatusBar eventId={id} />
      </div>
      <main className="container mx-auto px-2 md:px-4 bg-gray-50">
        <div className="py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
