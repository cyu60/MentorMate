import { createSupabaseClient } from "@/app/utils/supabase/server";
import { EventsList } from "@/components/events/events-list";
import { Footer } from "@/components/layout/footer";

export default async function EventsPage() {
  const supabase = createSupabaseClient();

  const { data: events } = await supabase
    .from("events")
    .select("event_id, event_name, event_date, location, cover_image_url")
    .order("event_date", { ascending: true });

  console.log(events);

  const eventsList = events || [];

  return (
    <div className="min-h-[90vh] flex flex-col bg-blue-50">
      <div className="flex-grow">
        <div className="container mx-auto py-8 px-4 sm:px-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-blue-900">
            Upcoming Events
          </h1>
          <EventsList events={eventsList} />
          {eventsList.length === 0 && (
            <p className="text-center text-muted-foreground">
              No upcoming events found.
            </p>
          )}
          <pre>{JSON.stringify(events, null, 2)}</pre>
          {JSON.stringify(eventsList)}
        </div>
      </div>
      <Footer />
    </div>
  );
}
