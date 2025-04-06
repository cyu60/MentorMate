import { NextRequest, NextResponse } from "next/server";
import { createInviteLink } from "@/lib/inviteUtils";
import { EventRole } from "@/lib/types";
import { createServerSupabaseClient } from "@/app/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { eventId, role, email } = await req.json();

    // Validate required parameters
    if (!eventId || !role) {
      return NextResponse.json(
        { error: "Missing required parameters: eventId and role" },
        { status: 400 }
      );
    }

    // Validate role type
    if (!Object.values(EventRole).includes(role as EventRole)) {
      return NextResponse.json(
        { error: "Invalid role. Must be a valid EventRole." },
        { status: 400 }
      );
    }

    //need to get the session server side somehow

    // Get current user session
    const supabase = await createServerSupabaseClient();

    const {
      data,
      error,
    } = await supabase.auth.getUser();

    console.log("data", data);

    if (error || !data.user?.email) {
      return NextResponse.json(
        { error: "You must be authenticated to generate invites" },
        { status: 401 }
      );
    }

    // Get user profile to check permissions
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("uid")
      .eq("email", data.user.email)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if user has appropriate role to generate invites
    const { data: userRole, error: roleError } = await supabase
      .from("user_event_roles")
      .select("role")
      .eq("user_id", userProfile.uid)
      .eq("event_id", eventId)
      .single();

    if (roleError) {
      return NextResponse.json(
        { error: "Error checking user permissions" },
        { status: 500 }
      );
    }

    // Only organizers and admins can generate invites
    if (
      !userRole ||
      (userRole.role !== EventRole.Organizer &&
        userRole.role !== EventRole.Admin)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions to generate invites" },
        { status: 403 }
      );
    }

    // Verify the event exists
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("event_id, event_name")
      .eq("event_id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Generate invite link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const inviteLink = createInviteLink(
      eventId,
      role as EventRole,
      email,
      baseUrl
    );

    // Return the generated invite link
    return NextResponse.json({
      inviteLink,
      eventName: event.event_name,
      role,
      email: email || "anyone",
      expiresIn: "1d",
    });
  } catch (error) {
    console.error("Error generating invite link:", error);
    return NextResponse.json(
      { error: "Failed to generate invite link" },
      { status: 500 }
    );
  }
}
