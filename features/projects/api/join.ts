import { createSupabaseClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function generateJoinToken(projectId: string): Promise<string> {
  return crypto.createHash('sha256')
    .update(`${projectId}-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 32);
}

export async function createJoinLink(projectId: string, userEmail: string) {
  const supabase = await createSupabaseClient();
  
  // Verify user is project lead
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('lead_email, project_name')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (project.lead_email !== userEmail) {
    return NextResponse.json({ error: 'Only project lead can create join links' }, { status: 403 });
  }

  const token = await generateJoinToken(projectId);
  const joinUrl = `${process.env.NEXT_PUBLIC_APP_URL}/projects/join/${projectId}/${token}`;
  
  // Store token in database with expiration (24 hours)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
  // Note: You'll need to create a join_tokens table for this
  // For now, return the URL without storing the token
  
  return NextResponse.json({ 
    joinUrl,
    token,
    expiresAt,
    projectName: project.project_name
  });
}

export async function joinProject(projectId: string, token: string, userEmail: string) {
  const supabase = await createSupabaseClient();
  
  // Get project details
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('teammates, lead_email, project_name')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Check if user is already on the team
  const currentTeammates = project.teammates || [];
  if (project.lead_email === userEmail || currentTeammates.includes(userEmail)) {
    return NextResponse.json({ error: 'Already a member of this project' }, { status: 400 });
  }

  // Add user to teammates
  const updatedTeammates = [...currentTeammates, userEmail];
  
  const { data: updatedProject, error: updateError } = await supabase
    .from('projects')
    .update({ teammates: updatedTeammates })
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ 
    success: true,
    project: updatedProject,
    message: `Successfully joined ${project.project_name}`
  });
}

export async function leaveProject(projectId: string, userEmail: string) {
  const supabase = await createSupabaseClient();
  
  // Get project details
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('teammates, lead_email')
    .eq('id', projectId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // Check if user is project lead
  if (project.lead_email === userEmail) {
    return NextResponse.json({ error: 'Project lead cannot leave. Transfer ownership first.' }, { status: 400 });
  }

  // Remove user from teammates
  const currentTeammates = project.teammates || [];
  const updatedTeammates = currentTeammates.filter((email: string) => email !== userEmail);
  
  const { data: updatedProject, error: updateError } = await supabase
    .from('projects')
    .update({ teammates: updatedTeammates })
    .eq('id', projectId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ 
    success: true,
    project: updatedProject,
    message: 'Successfully left the project'
  });
}