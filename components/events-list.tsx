'use client'

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Event {
  event_id: string // UUID
  event_name: string
  event_date: string
  location: string
}

interface EventsListProps {
  events: Event[]
}

export function EventsList({ events }: EventsListProps) {
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([])

  useEffect(() => {
    async function fetchJoinedEvents() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data } = await supabase
          .from('user_profiles')
          .select('events')
          .eq('email', session.user.email)
          .single()

        if (data?.events && Array.isArray(data.events)) {
          setJoinedEventIds(data.events)
        }
      } catch (error) {
        console.error('Error fetching joined events:', error)
      }
    }

    fetchJoinedEvents()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <Link href={`/events/${event.event_id}/overview`} key={event.event_id}>
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{event.event_name}</CardTitle>
                {joinedEventIds.includes(event.event_id) && (
                  <Badge className="bg-green-600">Joined</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Badge variant="secondary">{event.event_date}</Badge>
              <Badge variant="outline">{event.location}</Badge>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}