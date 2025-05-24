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
      .select(
        `
        id,
        project_name,
        lead_name,
        lead_email,
        project_description,
        teammates,
        project_url,
        additional_materials_url,
        cover_image_url,
        event_id,
        created_at,
        project_tracks (
          event_tracks (
            track_id,
            event_id,
            name,
            description,
            label,
            prize_amount,
            prize_description,
            scoring_criteria,
            created_at,
            updated_at
          )
        )
      `
      )
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
      tracks:
        data.project_tracks
          ?.map((pt) => pt.event_tracks?.[0])
          .filter(Boolean) || [],
      track_ids:
        data.project_tracks
          ?.map((pt) => pt.event_tracks?.[0]?.track_id)
          .filter(Boolean) || [],
      created_at: data.created_at,
    };

    // Optionally fetch the event name
    if (includeEventName && data.event_id) {
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("event_name")
        .eq("event_id", data.event_id)
        .single();

      if (!eventError && eventData) {
        project.event_name = eventData.event_name;
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
    // Get current user's session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user?.email) return [];

    const userEmail = session.user.email;

    // Fetch projects where user is lead
    const { data: leadProjects, error: leadError } = await supabase
      .from("projects")
      .select(
        `
        id,
        project_name,
        lead_name,
        lead_email,
        project_description,
        teammates,
        project_url,
        additional_materials_url,
        cover_image_url,
        event_id,
        created_at,
        project_tracks (
          event_tracks (
            track_id,
            event_id,
            name,
            description,
            label,
            prize_amount,
            prize_description,
            scoring_criteria,
            created_at,
            updated_at
          )
        )
      `
      )
      .eq("event_id", eventId)
      .eq("lead_email", userEmail)
      .order("project_name");

    if (leadError) {
      console.error("Error fetching lead projects:", leadError);
      return [];
    }

    // Fetch projects where user is a teammate
    const { data: teamProjects, error: teamError } = await supabase
      .from("projects")
      .select(
        `
        id,
        project_name,
        lead_name,
        lead_email,
        project_description,
        teammates,
        project_url,
        additional_materials_url,
        cover_image_url,
        event_id,
        created_at,
        project_tracks (
          event_tracks (
            track_id,
            event_id,
            name,
            description,
            label,
            prize_amount,
            prize_description,
            scoring_criteria,
            created_at,
            updated_at
          )
        )
      `
      )
      .eq("event_id", eventId)
      .contains("teammates", [userEmail])
      .order("project_name");

    if (teamError) {
      console.error("Error fetching team projects:", teamError);
      return [];
    }

    // Combine and deduplicate projects
    const allProjects = [
      ...(leadProjects || []),
      ...(teamProjects || []),
    ].filter(
      (project, index, self) =>
        index === self.findIndex((p) => p.id === project.id)
    );

    return allProjects.map((item) => ({
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
      tracks:
        item.project_tracks
          ?.map((pt) => pt.event_tracks?.[0])
          .filter(Boolean) || [],
      track_ids:
        item.project_tracks
          ?.map((pt) => pt.event_tracks?.[0]?.track_id)
          .filter(Boolean) || [],
      created_at: item.created_at,
    }));
  } catch (error) {
    console.error("Unexpected error fetching projects by event:", error);
    return [];
  }
}
