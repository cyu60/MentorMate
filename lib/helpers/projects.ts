import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";

/**
 * Fetches a project by its ID
 * @param projectId The ID of the project to fetch
 * @param includeEventName If true, fetches the event name from the events table
 * @returns The project data or null if not found
 */
export async function fetchProjectById(
  projectId: string,
  includeEventName: boolean = false
): Promise<Project | null> {
  if (!projectId) return null;

  try {
    // Fetch project data
    const { data, error } = await supabase
      .from("projects")
      .select(`
        id,
        project_name,
        lead_name,
        lead_email,
        project_description,
        teammates,
        project_url,
        additional_materials_url,
        cover_image_url,
        event_id
      `)
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return null;
    }

    if (!data) {
      return null;
    }

    const project: Project = {
      id: data.id,
      project_name: data.project_name,
      lead_name: data.lead_name,
      lead_email: data.lead_email,
      project_description: data.project_description,
      teammates: data.teammates,
      project_url: data.project_url,
      additional_materials_url: data.additional_materials_url,
      cover_image_url: data.cover_image_url,
      event_id: data.event_id,
      event_name: "",
    };

    // Optionally fetch the event name
    if (includeEventName && data.event_id) {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("name")
        .eq("id", data.event_id)
        .single();

      if (!eventError && eventData) {
        project.event_name = eventData.name;
      }
    }

    return project;
  } catch (error) {
    console.error("Unexpected error fetching project:", error);
    return null;
  }
}

/**
 * Fetches projects by event ID
 * @param eventId The ID of the event to fetch projects for
 * @returns Array of projects or empty array if none found
 */
export async function fetchProjectsByEventId(
  eventId: string
): Promise<Project[]> {
  if (!eventId) return [];

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        id,
        project_name,
        lead_name,
        lead_email,
        project_description,
        teammates,
        project_url,
        additional_materials_url,
        cover_image_url,
        event_id
      `)
      .eq("event_id", eventId)
      .order("project_name");

    if (error) {
      console.error("Error fetching projects for event:", error);
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      project_name: item.project_name,
      lead_name: item.lead_name,
      lead_email: item.lead_email,
      project_description: item.project_description,
      teammates: item.teammates,
      project_url: item.project_url,
      additional_materials_url: item.additional_materials_url,
      cover_image_url: item.cover_image_url,
      event_id: item.event_id,
    }));
  } catch (error) {
    console.error("Unexpected error fetching projects by event:", error);
    return [];
  }
} 