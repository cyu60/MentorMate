/**
 * String-related utility functions
 */

/**
 * Generates initials from a name
 * @param name - The name to generate initials from
 * @returns The uppercase initials, or "?" if name is null/undefined
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  const parts = name.split(" ");
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};