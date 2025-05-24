import { createSupabaseClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function updateProject(projectId: string, updateData: any) {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ project: data });
}

export async function updateProjectTeam(projectId: string, teammates: string[]) {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('projects')
    .update({ teammates })
    .eq('id', projectId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ project: data });
}