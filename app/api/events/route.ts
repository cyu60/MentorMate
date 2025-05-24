import { NextResponse } from "next/server";
import { EventRole, EventVisibility } from "@/lib/types";
import { createSupabaseClient } from "@/app/utils/supabase/server";
import { ADMIN_USER_IDS } from "@/lib/config/constants";

export async function GET() {
  const supabase = await createSupabaseClient();

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      // If not authenticated, only return public and private events
      const { data: visibleEvents, error: visibleError } = await supabase
        .from("events")
        .select("*")
        .in("visibility", [EventVisibility.Public, EventVisibility.Private]);

      if (visibleError) throw visibleError;
      return NextResponse.json({ events: visibleEvents });
    }

    const userId = user.id;

    // Get user's roles in all events
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_event_roles")
      .select("event_id, role")
      .eq("user_id", userId);

    if (rolesError) throw rolesError;

    // Check if user is an admin in any event
    const isAdmin = ADMIN_USER_IDS.includes(userId);
    
    // Get event IDs where user is an organizer
    const organizerEventIds = userRoles
      .filter(role => role.role === EventRole.Organizer)
      .map(role => role.event_id);

    // Build query for events based on visibility and user role
    let query = supabase.from("events").select("*");

    if (isAdmin) {
      // Admins can see all events (public, private, draft, demo, test)
      // No additional filter needed
    } else if (organizerEventIds.length > 0) {
      // For organizers:
      // - Public and private events (visible to everyone)
      // - Draft events where user is an organizer
      // - No demo or test events
      query = query.or(
        `visibility.in.(${[EventVisibility.Public, EventVisibility.Private].join(",")}),` + 
        `and(visibility.eq.${EventVisibility.Draft},event_id.in.(${organizerEventIds.join(",")}))`
      );
    } else {
      // Regular users only see public and private events
      query = query.in("visibility", [EventVisibility.Public, EventVisibility.Private]);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) throw eventsError;

    // Include user role with each event
    const eventsWithRole = events.map(event => {
      const userRole = userRoles.find(role => role.event_id === event.event_id)?.role || null;
      return { ...event, userRole };
    });

    return NextResponse.json({ events: eventsWithRole });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
} 