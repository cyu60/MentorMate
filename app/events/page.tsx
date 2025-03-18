import { createSupabaseClient } from "@/app/utils/supabase/server";
import { AuthNavbar } from "@/components/layout/authNavbar";
import { Footer } from "@/components/layout/footer";
import { EventsPageClient } from "@/components/eventsPageClient";

// Disable static generation for this page
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const supabase = createSupabaseClient();

  const { data: events } = await supabase
    .from("events")
    .select("event_id, event_name, event_date, location, cover_image_url")
    .order("event_date", { ascending: true });

  const eventsList = events || [];

  return (
    <div className="min-h-[90vh] flex flex-col bg-gray-50">
      <AuthNavbar />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-blue-900">
            Events
          </h1>
          <EventsPageClient eventsList={eventsList} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
