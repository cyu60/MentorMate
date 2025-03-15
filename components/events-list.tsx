'use client'

import Link from "next/link"
import { Card, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface Event {
  event_id: string
  event_name: string
  event_date: string
  location: string
  cover_image_url?: string
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
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2 max-w-7xl mx-auto">
      {events.map((event) => (
        <Link href={`/events/${event.event_id}/overview`} key={event.event_id}>
          <Card className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
            <div
              className="h-[200px] w-full bg-[#000080]"
              style={event.cover_image_url ? {
                backgroundImage: `url(${event.cover_image_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : undefined}
            />
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-semibold">{event.event_name}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-sm">{event.event_date}</Badge>
                    <Badge variant="outline" className="text-sm">{event.location}</Badge>
                  </div>
                </div>
                {joinedEventIds.includes(event.event_id) && (
                  <Badge className="bg-green-600">Joined</Badge>
                )}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  )
}