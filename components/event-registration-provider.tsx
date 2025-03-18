'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface EventRegistrationContextType {
  isRegistered: boolean
  setIsRegistered: (value: boolean) => void
}

const EventRegistrationContext = createContext<EventRegistrationContextType | null>(null)

export function useEventRegistration() {
  const context = useContext(EventRegistrationContext)
  if (!context) {
    throw new Error('useEventRegistration must be used within an EventRegistrationProvider')
  }
  return context
}

interface EventRegistrationProviderProps {
  eventId: string
  children: React.ReactNode
}

export function EventRegistrationProvider({ eventId, children }: EventRegistrationProviderProps) {
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    async function checkRegistrationStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        const { data: profile } = await supabase
          .from('user_profiles')
          .select()
          .eq('email', session.user.email)
          .single()

        if (profile?.events) {
          setIsRegistered(profile.events.includes(eventId))
        }
      } catch (error) {
        console.error('Error checking registration status:', error)
      }
    }

    checkRegistrationStatus()
  }, [eventId])

  return (
    <EventRegistrationContext.Provider value={{ isRegistered, setIsRegistered }}>
      {children}
    </EventRegistrationContext.Provider>
  )
}