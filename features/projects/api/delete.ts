import { createSupabaseClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function deleteProject(projectId: string, userId: string) {
  const supabase = await createSupabaseClient();
  
  // Verify user is project lead
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('lead_email, teammates')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Get user email for authorization
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user is lead or team member
  const isLead = project.lead_email === user.user.email;
  const isTeammate = project.teammates?.includes(user.user.email);

  if (!isLead && !isTeammate) {
    return NextResponse.json({ error: 'Unauthorized to delete this project' }, { status: 403 });
  }

  // Delete project scores first (foreign key constraint)
  await supabase
    .from('project_scores')
    .delete()
    .eq('project_id', projectId);

  // Delete project
  const { error: deleteError } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}