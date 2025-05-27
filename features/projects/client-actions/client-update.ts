import { supabase } from "@/lib/supabase";
import { Project } from "@/lib/types";
import { PostgrestError } from "@supabase/supabase-js";

export async function updateProjectClient(
  projectId: string, 
  updateData: Partial<Project>
): Promise<{ data: Project | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .select()
    .single();

  return { data, error };
}

export async function updateProjectTeamClient(
  projectId: string, 
  teammates: string[]
): Promise<{ data: Project | null; error: PostgrestError | null }> {
  const { data, error } = await supabase
    .from("projects")
    .update({ teammates })
    .eq("id", projectId)
    .select()
    .single();

  return { data, error };
} 