"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ERROR_MESSAGES } from "@/lib/constants";
import { EventRole } from "@/lib/types";

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
  userRole: EventRole | null;
  setUserRole: (value: EventRole | null) => void;
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
  const [userRole, setUserRole] = useState<EventRole | null>(null);

  useEffect(() => {
    async function checkRegistrationStatus() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        // Check user_event_roles table for role
        const { data: roleData } = await supabase
          .from("user_event_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("event_id", eventId)
          .maybeSingle();

        if (roleData) {
          setIsRegistered(true);
          setUserRole(roleData.role as EventRole);
        } else {
          setIsRegistered(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error(ERROR_MESSAGES.REGISTRATION_STATUS, error);
      }
    }

    checkRegistrationStatus();
  }, [eventId]);

  return (
    <EventRegistrationContext.Provider
      value={{ isRegistered, setIsRegistered, userRole, setUserRole }}
    >
      {children}
    </EventRegistrationContext.Provider>
  );
}
