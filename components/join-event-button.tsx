'use client'

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface JoinEventButtonProps {
  eventId: string
  eventName: string
}

export function JoinEventButton({ eventId, eventName }: JoinEventButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkIfJoined() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select()
          .eq('email', session.user.email)
          .single()

        if (profile) {
          const events = profile.events || []
          setHasJoined(events.includes(eventId))
        }
      } catch (error) {
        console.error('Error checking event status:', error)
      }
    }

    checkIfJoined()
  }, [eventId])

  const handleJoinEvent = async () => {
    try {
      setIsLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        localStorage.setItem('returnUrl', `/events/${eventId}/overview`)
        router.push('/login')
        return
      }

      let { data: profile, error: fetchError } = await supabase
        .from('user_profiles')
        .select()
        .eq('email', session.user.email)
        .single()

      if (!profile && !fetchError) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            email: session.user.email,
            user_id: session.user.id,
          })

        if (insertError) {
          console.error('Error inserting user profile:', insertError.message)
          return
        }

        // Retry fetching the profile after insertion
        const retryResult = await supabase
          .from('user_profiles')
          .select()
          .eq('email', session.user.email)
          .single()

        profile = retryResult.data
        fetchError = retryResult.error
      }

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError.message)
        return
      }

      const currentEvents: string[] = profile.events || []
      
      if (currentEvents.includes(eventId)) {
        setHasJoined(true)
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

      setHasJoined(true)
      router.refresh()
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

  if (hasJoined) return null;

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