export function getProjectSubmissionEmailTemplate(projectName: string) {
  return {
    subject: `Project "${projectName}" Submitted - Mentor Mates`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">Project Submission Confirmation</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 16px;">
          Thank you for submitting your project "${projectName}" to the Mentor Mates!
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 16px;">
          Your project has been successfully submitted and is now ready for mentor feedback.
          You will receive notifications when mentors provide feedback on your project.
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