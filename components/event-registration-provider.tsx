"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ERROR_MESSAGES } from "@/lib/constants";

const EventRegistrationContext =
  createContext<EventRegistrationContextType | null>(null);

export function useEventRegistration() {
  const context = useContext(EventRegistrationContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.REGISTRATION_CONTEXT);
  }
  return context;
}

export interface EventRegistrationContextType {
  isRegistered: boolean;
  setIsRegistered: (value: boolean) => void;
}

export interface EventRegistrationProviderProps {
  eventId: string;
  children: React.ReactNode;
}

export function EventRegistrationProvider({
  eventId,
  children,
}: EventRegistrationProviderProps) {
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    async function checkRegistrationStatus() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profile } = await supabase
          .from("user_profiles")
          .select()
          .eq("email", session.user.email)
          .single();

        if (profile?.events) {
          setIsRegistered(profile.events.includes(eventId));
        }
      } catch (error) {
        console.error(ERROR_MESSAGES.REGISTRATION_STATUS, error);
      }
    }

    checkRegistrationStatus();
  }, [eventId]);

  return (
    <EventRegistrationContext.Provider
      value={{ isRegistered, setIsRegistered }}
    >
      {children}
    </EventRegistrationContext.Provider>
  );
}
