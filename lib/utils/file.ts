/**
 * File-related utility functions
 */

/**
 * Extracts the filename from a URL
 * @param url - The URL containing the filename
 * @returns The decoded filename without query parameters
 */
export const getFileNameFromUrl = (url: string): string => {
  const pathParts = url.split("/");
  const fileName = pathParts[pathParts.length - 1];
  return decodeURIComponent(fileName.split("?")[0]);
};