/**
 * Gets initials from a name
 * @param name The name to get initials from
 * @returns The initials or a fallback
 */
export const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};

/**
 * Extracts a filename from a URL
 * @param url The URL to extract from
 * @returns The filename
 */
export const getFileNameFromUrl = (url: string): string => {
  if (!url) return "file";
  
  const parts = url.split("/");
  return parts[parts.length - 1].split("?")[0] || "file";
}; 