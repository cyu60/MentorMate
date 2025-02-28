import { createSupabaseClient } from "@/app/utils/supabase/server"
import { EventsList } from "@/components/events-list"

export default async function EventsPage() {
  const supabase = createSupabaseClient()
  
  const { data: events } = await supabase
    .from('events')
    .select('event_id, event_name, event_date, location')
    .order('event_date', { ascending: true })

  const eventsList = events || []

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      <EventsList events={eventsList} />
      {eventsList.length === 0 && (
        <p className="text-center text-muted-foreground">No upcoming events found.</p>
      )}
    </div>
  )
}
