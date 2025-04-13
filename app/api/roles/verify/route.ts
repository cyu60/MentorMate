import { NextResponse } from "next/server";
import { EventRole } from "@/lib/types";
import * as bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

export async function POST(request: Request) {

    //doesn't work; supabase client does not connect to the server for some reason

  try {
    // Get request data
    const { eventId, role, password, userId } = await request.json();

    console.log("Event ID", eventId);
    console.log("Role", role);
    console.log("Password", password);
    console.log("User ID", userId);

    // Input validation
    if (!eventId || !role || !userId) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if role is protected (Judge or Organizer)
    const isProtectedRole =
      role === EventRole.Judge || role === EventRole.Organizer;

    // If protected role, verify password
    if (isProtectedRole) {
      if (!password) {
        return NextResponse.json(
          { success: false, message: "Password required for this role" },
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
          { success: false, message: "No password set for this role" },
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
          { success: false, message: "Invalid password" },
          { status: 401 }
        );
      }
    } else {
      // For non-protected roles (Participant or Mentor), verify the role is valid
      if (role !== EventRole.Participant && role !== EventRole.Mentor) {
        return NextResponse.json(
          { success: false, message: "Invalid role" },
          { status: 400 }
        );
      }
    }

    // At this point, either:
    // 1. It's a protected role and the password was verified
    // 2. It's a non-protected role
    // So we can proceed with role assignment

    // Assign role to user
    const { data: roleData, error: roleError } = await supabase
      .from("user_event_roles")
      .upsert(
        {
          user_id: userId,
          event_id: eventId,
          role: role,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,event_id",
        }
      ).select();

    console.log("Role data", roleData);

    if (roleError) {
      return NextResponse.json(
        { success: false, message: "Failed to assign role" },
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
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
