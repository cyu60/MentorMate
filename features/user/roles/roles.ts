import { EventRole } from "@/lib/types";

/**
 * Default role labels used when custom labels are not defined
 */
export const DEFAULT_ROLE_LABELS: Record<string, string> = {
  [EventRole.Participant]: "Participant",
  [EventRole.Mentor]: "Mentor",
  [EventRole.Judge]: "Judge",
  [EventRole.Organizer]: "Organizer",
  [EventRole.Admin]: "Admin",
};

/**
 * Get the display label for a role based on the event's custom configuration
 *
 * @param role The role enum value
 * @param eventRoleLabels The event's custom role labels (if any)
 * @returns The display label for the role
 */
export function getRoleLabel(
  role: EventRole | string,
  eventRoleLabels?: Record<string, string> | null
): string {
  // If we have custom labels for this event and this role has a custom label
  if (eventRoleLabels && eventRoleLabels[role]) {
    return eventRoleLabels[role];
  }

  // Fall back to default labels
  return (
    DEFAULT_ROLE_LABELS[role] ||
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
  );
}

/**
 * Get the role key from a display label
 *
 * @param label The display label
 * @param eventRoleLabels The event's custom role labels (if any)
 * @returns The role key that matches the label
 */
export function getRoleFromLabel(
  label: string,
  eventRoleLabels?: Record<string, string> | null
): EventRole | null {
  // If we have custom labels, check if any match the given label
  if (eventRoleLabels) {
    for (const [role, roleLabel] of Object.entries(eventRoleLabels)) {
      if (roleLabel.toLowerCase() === label.toLowerCase()) {
        return role as EventRole;
      }
    }
  }

  // Check against default labels
  for (const [role, defaultLabel] of Object.entries(DEFAULT_ROLE_LABELS)) {
    if (defaultLabel.toLowerCase() === label.toLowerCase()) {
      return role as EventRole;
    }
  }

  return null;
}
