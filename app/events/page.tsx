import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const events = [
  { id: 1, name: "John's Hopkins Hackathon", date: "June 15-17, 2023" },
  { id: 2, name: "MIT Health Tech Hackathon", date: "July 8-10, 2023" },
  { id: 3, name: "Stanford AI for Good Hackathon", date: "August 20-22, 2023" },
]

export default function EventsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link href={`/events/${event.id}`} key={event.id}>
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle>{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{event.date}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

