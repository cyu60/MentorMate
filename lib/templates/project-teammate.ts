export function getProjectTeammateEmailTemplate(projectName: string, leadName: string) {
  return {
    subject: `Added to Project "${projectName}" - Mentor Mates`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">Project Team Notification</h1>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 16px;">
          You have been added as a team member to the project "${projectName}" by ${leadName} in Mentor Mates.
        </p>
        
        <p style="font-size: 16px; line-height: 1.5; color: #374151; margin-bottom: 16px;">
          The project has been submitted and is now ready for mentor feedback.
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