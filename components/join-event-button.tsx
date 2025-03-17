'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useEventRegistration } from "./event-registration-provider"

interface JoinEventButtonProps {
  eventId: string
  eventName: string
}

export function JoinEventButton({ eventId, eventName }: JoinEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { isRegistered, setIsRegistered } = useEventRegistration()

  const handleJoinEvent = async () => {
    try {
      setIsLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        localStorage.setItem('returnUrl', `/events/${eventId}/overview`)
        router.push('/login')
        return
      }

      const { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select()
        .eq('email', session.user.email)
        .single()

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError.message)
        return
      }

      const currentEvents: string[] = profile.events || []
      
      if (currentEvents.includes(eventId)) {
        setIsRegistered(true)
        return
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ events: [...currentEvents, eventId] })
        .eq('email', session.user.email)

      if (updateError) {
        console.error('Error updating profile:', updateError.message)
        return
      }

      setIsRegistered(true)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error joining event:', error.message)
      } else {
        console.error('Error joining event:', error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isRegistered) return null;

  return (
    <Button
      onClick={handleJoinEvent}
      disabled={isLoading}
      className="bg-blue-700 hover:bg-blue-800"
    >
      {isLoading ? "Joining..." : `Join ${eventName}`}
    </Button>
  )
}