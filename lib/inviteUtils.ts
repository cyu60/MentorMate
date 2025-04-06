import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { EventRole } from "./types";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Interface for invite token payload
export interface InviteTokenPayload {
  eventId: string;
  role: EventRole;
  email?: string;
  expiresIn: string;
}

export interface DecodedInviteTokenPayload extends InviteTokenPayload {
  exp: number;
}

/**
 * Generate an invite token for OAuth authentication
 * @param eventId The ID of the event to invite to
 * @param role The role to assign the user
 * @param email Optional email for targeted invites
 * @param expiresIn Time in seconds until token expires (default: 7 days)
 * @returns The signed JWT token
 */
export function generateInviteToken(
  eventId: string,
  role: EventRole,
  email?: string,
  expiresIn?: string
): string {
  const payload: InviteTokenPayload = {
    eventId,
    role,
    email,
    expiresIn: expiresIn || "1d",
  };

  return jwt.sign(payload, process.env.SUPABASE_JWT_SECRET!);
}

/**
 * Verify and decode an invite token
 * @param token The JWT token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyInviteToken(token: string): DecodedInviteTokenPayload | null {
  try {
    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET!
    ) as DecodedInviteTokenPayload;

    // Check if token has expired
    if (decoded.exp < Date.now() / 1000) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Error verifying invite token:", error);
    return null;
  }
}

/**
 * Create an invite link for a specific event and role
 * @param eventId The ID of the event
 * @param role The role to assign
 * @param email Optional email for targeted invites
 * @param baseUrl The base URL of the application
 * @returns The full invite URL
 */
export function createInviteLink(
  eventId: string,
  role: EventRole,
  email?: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || ""
): string {
  const token = generateInviteToken(eventId, role, email);
  return `${baseUrl}/invite?token=${token}`;
}

/**
 * Process an invite token for a user after authentication
 * @param token The invite token
 * @param userId The user ID to assign the role to
 * @returns Success status and any error message
 */
export async function processInvite(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const payload = verifyInviteToken(token);
  
  if (!payload) {
    return { success: false, error: "Invalid or expired invite link" };
  }

  // If email is specified in the token, verify it matches the authenticated user
  if (payload.email) {
    const { data: userData, error: userError } = await supabase
      .from("user_profiles")
      .select("email")
      .eq("uid", userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: "Error retrieving user data" };
    }

    if (userData.email !== payload.email) {
      return { 
        success: false, 
        error: "This invite link is for a different email address" 
      };
    }
  }

  // Verify the event exists
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("event_id")
    .eq("event_id", payload.eventId)
    .single();

  if (eventError || !eventData) {
    return { success: false, error: "Event not found" };
  }

  // Check if user already has a role in this event
  const { data: existingRole, error: roleError } = await supabase
    .from("user_event_roles")
    .select("id, role")
    .eq("user_id", userId)
    .eq("event_id", payload.eventId)
    .maybeSingle();

  if (roleError) {
    return { success: false, error: "Error checking existing roles" };
  }

  // If user already has a role, update it if the new role has higher privileges
  if (existingRole) {
    // Only update if the new role has higher privileges
    if (shouldUpdateRole(existingRole.role as EventRole, payload.role)) {
      const { error: updateError } = await supabase
        .from("user_event_roles")
        .update({ role: payload.role, updated_at: new Date().toISOString() })
        .eq("id", existingRole.id);

      if (updateError) {
        return { success: false, error: "Error updating role" };
      }
    }
  } else {
    // Create new role assignment
    const { error: insertError } = await supabase
      .from("user_event_roles")
      .insert({
        user_id: userId,
        event_id: payload.eventId,
        role: payload.role,
      });

    if (insertError) {
      return { success: false, error: "Error assigning role" };
    }
  }

  return { success: true };
}

/**
 * Determine if a role should be updated based on privileges
 * @param currentRole The user's current role
 * @param newRole The proposed new role
 * @returns Whether the role should be updated
 */
function shouldUpdateRole(currentRole: EventRole, newRole: EventRole): boolean {
  const rolePriority = {
    [EventRole.Participant]: 1,
    [EventRole.Mentor]: 2,
    [EventRole.Judge]: 3,
    [EventRole.Organizer]: 4,
    [EventRole.Admin]: 5,
  };

  return rolePriority[newRole] > rolePriority[currentRole];
} 