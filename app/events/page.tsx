import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { createSupabaseClient } from "@/app/utils/supabase/server"
import { Badge } from "@/components/ui/badge"

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventsList.map((event) => (
          <Link href={`/events/${event.event_id}`} key={event.event_id}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{event.event_name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Badge variant="secondary">{event.event_date}</Badge>
                <Badge variant="outline">{event.location}</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {eventsList.length === 0 && (
        <p className="text-center text-muted-foreground">No upcoming events found.</p>
      )}
    </div>
  )
}
