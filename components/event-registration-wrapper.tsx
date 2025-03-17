'use client'

import { EventRegistrationProvider } from "./event-registration-provider"

interface EventRegistrationWrapperProps {
  eventId: string
  children: React.ReactNode
}

export function EventRegistrationWrapper({ eventId, children }: EventRegistrationWrapperProps) {
  return (
    <EventRegistrationProvider eventId={eventId}>
      {children}
    </EventRegistrationProvider>
  )
}