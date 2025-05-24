import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getProjectSubmissionEmailTemplate } from '@/lib/templates/project-submission';
import { getProjectTeammateEmailTemplate } from '@/lib/templates/project-teammate';
import { getFeedbackNotificationEmailTemplate } from '@/lib/templates/feedback-notification';
import { createSupabaseClient } from '@/app/utils/supabase/server';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function getTeammateEmails(emails: string[]) {
  const supabase = await createSupabaseClient();
  if (!emails.length) return [];
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email')
    .in('email', emails);

  if (error) {
    return [];
  }

  return data.map(user => user.email);
}

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email to', to, ':', error);
    return false;
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseClient();

  try {
    const { type, ...data } = await request.json();

    if (!type) {
      return NextResponse.json(
        { error: 'Missing email type' },
        { status: 400 }
      );
    }

    if (type === 'project_submission') {
      const { to, projectName, leadName, teammates } = data;

      if (!to || !projectName || !leadName) {
        return NextResponse.json(
          { error: 'Missing required fields for project submission' },
          { status: 400 }
        );
      }

      const leadEmailTemplate = getProjectSubmissionEmailTemplate(projectName);
      await sendEmail(to, leadEmailTemplate.subject, leadEmailTemplate.html);

      if (teammates && teammates.length > 0) {
        const teammateEmails = await getTeammateEmails(teammates);
        const teammateEmailTemplate = getProjectTeammateEmailTemplate(projectName, leadName);

        await Promise.all(
          teammateEmails.map(email =>
            sendEmail(email, teammateEmailTemplate.subject, teammateEmailTemplate.html)
          )
        );
      }
    } else if (type === 'feedback') {
      const { to, projectName, mentorName, feedback, projectId } = data;

      if (!to || !projectName || !feedback || !projectId) {
        return NextResponse.json(
          { error: 'Missing required fields for feedback notification' },
          { status: 400 }
        );
      }
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('teammates')
        .eq('id', projectId)
        .single();

      if (projectError) {
        return NextResponse.json(
          { error: 'Failed to fetch project teammates' },
          { status: 500 }
        );
      }

      const teammateEmails = projectData.teammates?.length
        ? await getTeammateEmails(projectData.teammates)
        : [];

      const feedbackEmailTemplate = getFeedbackNotificationEmailTemplate(
        projectName,
        mentorName,
        feedback
      );

      await sendEmail(to, feedbackEmailTemplate.subject, feedbackEmailTemplate.html);

      if (teammateEmails.length > 0) {
        await Promise.all(
          teammateEmails.map(email =>
            sendEmail(email, feedbackEmailTemplate.subject, feedbackEmailTemplate.html)
          )
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid email type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}