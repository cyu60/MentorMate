import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

export async function deleteProjectClient(
  projectId: string
): Promise<{ success: boolean; error: PostgrestError | null }> {
  // First delete related project_tracks
  const { error: tracksError } = await supabase
    .from("project_tracks")
    .delete()
    .eq("project_id", projectId);

  if (tracksError) {
    return { success: false, error: tracksError };
  }

  // Then delete the project
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  return { success: !error, error };
} 