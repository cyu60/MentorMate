import { createSupabaseClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export interface FeedbackData {
  project_id: string;
  mentor_id: string;
  original_feedback: string;
  final_feedback: string;
  specific_ai_suggestion?: string;
  positive_ai_suggestion?: string;
  actionable_ai_suggestion?: string;
  modifier_field?: string[];
  event_id: string;
}

export async function createFeedback(feedbackData: FeedbackData) {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('feedback')
    .insert(feedbackData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ feedback: data });
}

export async function getFeedbackByProject(projectId: string) {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      mentor:mentor_id (
        display_name,
        email
      )
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ feedback: data });
}

export async function getFeedbackByMentor(mentorId: string) {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('feedback')
    .select(`
      *,
      project:project_id (
        project_name,
        lead_name,
        lead_email
      )
    `)
    .eq('mentor_id', mentorId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ feedback: data });
}

export async function updateFeedback(feedbackId: string, updateData: Partial<FeedbackData>) {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from('feedback')
    .update(updateData)
    .eq('id', feedbackId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ feedback: data });
}

export async function deleteFeedback(feedbackId: string, userId: string) {
  const supabase = await createSupabaseClient();
  
  // Verify user is the mentor who created the feedback
  const { data: feedback, error: fetchError } = await supabase
    .from('feedback')
    .select('mentor_id')
    .eq('id', feedbackId)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
  }

  if (feedback.mentor_id !== userId) {
    return NextResponse.json({ error: 'Unauthorized to delete this feedback' }, { status: 403 });
  }

  const { error: deleteError } = await supabase
    .from('feedback')
    .delete()
    .eq('id', feedbackId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}