"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { EventRole } from "@/lib/types";

interface Event {
  event_id: string;
  slug?: string;
  event_name: string;
  event_date: string;
  location: string;
  cover_image_url?: string;
}

interface UserEventRole {
  event_id: string;
  role: EventRole;
}

export interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const [userEventRoles, setUserEventRoles] = useState<UserEventRole[]>([]);

  useEffect(() => {
    async function fetchUserEventRoles() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;

        const { data, error } = await supabase
          .from("user_event_roles")
          .select("event_id, role")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching user event roles:", error);
          return;
        }

        if (data) {
          setUserEventRoles(data as UserEventRole[]);
        }
      } catch (error) {
        console.error("Error fetching user event roles:", error);
      }
    }

    fetchUserEventRoles();
  }, []);

  const getUserRoleForEvent = (eventId: string): EventRole | null => {
    const userEventRole = userEventRoles.find(
      (role) => role.event_id === eventId
    );
    return userEventRole ? userEventRole.role : null;
  };

  const getRoleBadgeVariant = (
    role: EventRole
  ): "participant" | "mentor" | "judge" | "organizer" | "admin" => {
    switch (role) {
      case EventRole.Admin:
        return "admin";
      case EventRole.Organizer:
        return "organizer";
      case EventRole.Judge:
        return "judge";
      case EventRole.Mentor:
        return "mentor";
      case EventRole.Participant:
        return "participant";
      default:
        return "participant";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 lg:px-8">
      {events.map((event) => {
        const userRole = getUserRoleForEvent(event.event_id);

        return (
          <Link
            href={`/events/${event.slug || event.event_id}/overview`}
            key={event.event_id}
            className="block h-full"
          >
            <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-2 hover:border-primary/50">
              <div
                className="w-full h-[150px] sm:h-[200px] bg-gradient-to-br from-primary/20 to-primary/10"
                style={
                  event.cover_image_url
                    ? {
                        backgroundImage: `url(${event.cover_image_url})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              />
              <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 flex-grow">
                <CardTitle className="text-lg sm:text-xl font-semibold line-clamp-2">
                  {event.event_name}
                </CardTitle>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {event.event_date}
                  </Badge>
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {event.location}
                  </Badge>
                </div>
                {userRole && (
                  <Badge
                    variant={getRoleBadgeVariant(userRole)}
                    className="capitalize text-xs sm:text-sm mt-1 sm:mt-2"
                  >
                    {userRole}
                  </Badge>
                )}
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
