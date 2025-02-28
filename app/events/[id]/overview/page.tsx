import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createSupabaseClient } from "@/app/utils/supabase/server"
import { notFound } from "next/navigation"

export default async function EventOverviewPage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseClient()
  
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !event) {
    notFound()
  }

  return (
    <div className="space-y-8">
      {/* Event Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary">{event.date}</Badge>
            <Badge variant="secondary">{event.location}</Badge>
          </div>
          <p className="text-muted-foreground">{event.description}</p>
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {event.schedule.map((day: any, index: number) => (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-3">{day.time}</h3>
                <div className="space-y-2">
                  {day.events.map((scheduleEvent: any, eventIndex: number) => (
                    <div key={eventIndex} className="flex justify-between items-center py-2 border-b last:border-0">
                      <span>{scheduleEvent.name}</span>
                      <span className="text-muted-foreground">{scheduleEvent.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prizes */}
      <Card>
        <CardHeader>
          <CardTitle>Prizes & Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {event.prizes.map((prize: any, index: number) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{prize.track}</CardTitle>
                  <div className="text-xl font-bold text-primary">{prize.prize}</div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{prize.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Important Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {event.resources.map((resource: any, index: number) => (
              <a
                key={index}
                href={resource.link}
                className="flex items-center justify-center p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {resource.name}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}