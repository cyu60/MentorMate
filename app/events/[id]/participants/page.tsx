'use client'

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Participant {
  uid: string
  display_name: string | null
  email: string
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkSessionAndFetchParticipants() {
      try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error checking session:', sessionError)
          router.push('/login')
          return
        }

        if (!session) {
          router.push('/login')
          return
        }

        // Fetch participants if authenticated
        const { data, error } = await supabase
          .from('user_profiles')
          .select('uid, display_name, email')

        if (error) {
          console.error('Error fetching participants:', error.message)
          setParticipants(null)
        } else {
          setParticipants(data)
        }
      } catch (err) {
        console.error('Error:', err)
        setParticipants(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSessionAndFetchParticipants()
  }, [router])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Loading participants...</div>
        </CardContent>
      </Card>
    )
  }

  if (!participants) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Failed to load participants</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Participants ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {participants.map((participant) => (
            <div key={participant.uid} className="flex items-center space-x-4">
              <Avatar>
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