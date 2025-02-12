import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getProjectSubmissionEmailTemplate } from '@/app/email-templates/project-submission';
import { getProjectTeammateEmailTemplate } from '@/app/email-templates/project-teammate';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function getTeammateEmails(displayNames: string[]) {
  if (!displayNames.length) return [];
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email')
    .in('display_name', displayNames);

  if (error) {
    console.error('Error fetching teammate emails:', error);
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
  try {
    const { to, projectName, leadName, teammates } = await request.json();

    if (!to || !projectName || !leadName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in email API route:', error);
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    );
  }
}