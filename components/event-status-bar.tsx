'use client'

import { CancelRegistration } from "@/components/cancel-registration"
import { useEventRegistration } from "./event-registration-provider"

interface EventStatusBarProps {
  eventId: string
}

export function EventStatusBar({ eventId }: EventStatusBarProps) {
  const { isRegistered } = useEventRegistration()

  if (!isRegistered) return null

  return (
    <div className="bg-green-600 text-white py-1.5 w-full">
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2 pl-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>You are participating in this event</span>
        </div>
        <div className="pr-4">
          <CancelRegistration eventId={eventId} />
        </div>
      </div>
    </div>
  );
}
