interface FeedbackEmailTemplate {
  subject: string;
  html: string;
}

export function getFeedbackNotificationEmailTemplate(
  projectName: string,
  mentorName: string | null,
  feedback: string
): FeedbackEmailTemplate {
  return {
    subject: `New Feedback for Project "${projectName}" - Mentor Mates`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">New Project Feedback</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 16px;">
          You have received new feedback for your project "${projectName}"${mentorName ? ` from mentor ${mentorName}` : ''}.
        </p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 8px; font-weight: bold;">
            Feedback:
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151; white-space: pre-wrap;">
            ${feedback.replace(/\n/g, '<br>')}
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 16px;">
          Please review this feedback and consider implementing the suggested improvements to enhance your project.
        </p>
        
        <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 8px;">
            Best regards,
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #374151; font-weight: bold;">
            The Mentor Mates Team
          </p>
        </div>
      </div>
    `,
  };
}