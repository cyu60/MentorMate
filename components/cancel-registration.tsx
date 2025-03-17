'use client'

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useEventRegistration } from "./event-registration-provider"

interface CancelRegistrationProps {
  eventId: string
}

export function CancelRegistration({ eventId }: CancelRegistrationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { setIsRegistered } = useEventRegistration()

  const handleCancelRegistration = async () => {
    try {
      setIsLoading(true)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select()
        .eq('email', session.user.email)
        .single()

      if (!profile) return

      const updatedEvents = profile.events.filter((id: string) => id !== eventId)

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ events: updatedEvents })
        .eq('email', session.user.email)

      if (updateError) {
        console.error('Error updating profile:', updateError.message)
        return
      }

      setIsRegistered(false)
    } catch (error) {
      console.error('Error canceling registration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCancelRegistration}
      disabled={isLoading}
      variant="ghost"
      size="sm"
      className="text-gray-600 hover:text-red-600"
    >
      {isLoading ? (
        "Canceling..."
      ) : (
        <div className="flex items-center gap-2">
          <span>Cancel Registration</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </Button>
  )
}