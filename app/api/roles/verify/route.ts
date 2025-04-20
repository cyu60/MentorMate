import { NextResponse } from "next/server";
import { EventRole, EventVisibility } from "@/lib/types";
import * as bcrypt from "bcrypt";
import { createSupabaseClient } from "@/app/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();

  try {
    // Get request data
    const { eventId, role, password, userId } = await request.json();

    // Input validation
    if (!eventId || !role || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle();

    if (eventError) {
      return NextResponse.json(
        { error: "Failed to fetch event" },
        { status: 500 }
      );
    }

    // Check if role is protected

    let isProtectedRole = false;
    if (event?.visibility === EventVisibility.Private) {
      isProtectedRole = true;
    } else {
      isProtectedRole =
        role === EventRole.Judge || role === EventRole.Organizer;
    }
    // If protected role, verify password
    if (isProtectedRole) {
      if (!password) {
        return NextResponse.json(
          { error: "Password required for this role" },
          { status: 400 }
        );
      }

      // Get the stored password hash
      const { data: rolePassword, error: fetchError } = await supabase
        .from("role_passwords")
        .select("password_hash")
        .eq("event_id", eventId)
        .eq("role", role)
        .single();

      if (fetchError || !rolePassword) {
        return NextResponse.json(
          { error: "No password set for this role" },
          { status: 404 }
        );
      }

      // Verify password
      const isValid = await bcrypt.compare(
        password,
        rolePassword.password_hash
      );

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid password" },
          { status: 401 }
        );
      }
    } else {
      // For non-protected roles (Participant or Mentor), verify the role is valid
      if (role !== EventRole.Participant && role !== EventRole.Mentor) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
    }

    // At this point, either:
    // 1. It's a protected role and the password was verified
    // 2. It's a non-protected role
    // So we can proceed with role assignment

    // Assign role to user
    const { error: roleError } = await supabase.from("user_event_roles").upsert(
      {
        user_id: userId,
        event_id: eventId,
        role: role,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,event_id",
      }
    );

    if (roleError) {
      return NextResponse.json(
        { error: "Failed to assign role" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Role assigned successfully",
    });
  } catch (error) {
    console.error("Error in role verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
