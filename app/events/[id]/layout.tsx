import type React from "react";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { notFound } from "next/navigation";
import { EventRegistrationWrapper } from "@/components/event-registration-wrapper";
import { EventHeader } from "@/components/events/event-header";
import type { Metadata } from "next";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { isValidUUID } from "@/app/utils/supabase/queries";

// add authentication check for non private/public events

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await Promise.resolve(params);
  const supabase = await createSupabaseClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  const isUUID = isValidUUID(id);

  let query = supabase.from("events").select(`
    event_id,
    slug,
    event_name,
    event_date,
    location,
    event_blurb,
    event_description,
    cover_image_url
  `);

  if (isUUID) {
    // If it's a UUID, check both slug and event_id
    query = query.or(`slug.eq.${id},event_id.eq.${id}`);
  } else {
    // If it's not a UUID, only check slug
    query = query.eq("slug", id);
  }

  const { data: event } = await query.single();

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated ? <AuthNavbar /> : <Navbar />}
      <EventRegistrationWrapper eventId={event.event_id}>
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 w-full">
            <EventHeader
              eventName={event.event_name}
              coverImageUrl={event.cover_image_url}
              eventDate={event.event_date}
              location={event.location}
              description={event.event_blurb || event.event_description}
              eventId={event.slug || event.event_id}
            />
            {children}
          </div>
        </main>
      </EventRegistrationWrapper>
      <Footer />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const supabase = await createSupabaseClient();

  const isUUID = isValidUUID(id);

  let query = supabase.from("events").select("event_name");

  if (isUUID) {
    // If it's a UUID, check both slug and event_id
    query = query.or(`slug.eq.${id},event_id.eq.${id}`);
  } else {
    // If it's not a UUID, only check slug
    query = query.eq("slug", id);
  }

  const { data: event } = await query.single();

  return {
    title: event?.event_name || "Event",
  };
}
