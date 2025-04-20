import { AuthNavbar } from "@/components/layout/authNavbar";
import { Footer } from "@/components/layout/footer";
import { EventsPageClient } from "@/components/eventsPageClient";
import { createSupabaseClient } from "../utils/supabase/server";
import { EventRole, EventVisibility } from "@/lib/types";
import { ADMIN_USER_IDS } from "@/lib/constants";
// Disable static generation for this page
export const dynamic = "force-dynamic";

export default async function EventsPage() {

  async function fetchEvents() {

    const supabase = await createSupabaseClient();
  
    try {
      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("User not authenticated");
        return [];
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
  
      return eventsWithRole;
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  } 

  const events = await fetchEvents();

  const eventsList = events || [];

  return (
    <div className="min-h-[90vh] flex flex-col bg-gray-50">
      <AuthNavbar />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto py-8 px-6 lg:px-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 text-center text-blue-900">
            Events
          </h1>
          <EventsPageClient eventsList={eventsList} />
        </div>
      </div>
      <Footer />
    </div>
  );
}
