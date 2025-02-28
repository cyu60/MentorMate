'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"

interface Participant {
  id: string
  display_name: string | null
  email: string
  avatar_url: string | null
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('id, display_name, email, avatar_url')

        if (error) throw error

        setParticipants(data)
      } catch (err) {
        console.error('Error fetching participants:', err)
        setError('Failed to load participants')
      } finally {
        setIsLoading(false)
      }
    }

    fetchParticipants()
  }, [supabase])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Loading participants...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participants?.length || 0})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {participants?.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={participant.avatar_url || '/placeholder.svg'} />
                <AvatarFallback>
                  {participant.display_name?.[0] || participant.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">
                  {participant.display_name || participant.email}
                </div>
                <div className="text-sm text-gray-500">{participant.email}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}