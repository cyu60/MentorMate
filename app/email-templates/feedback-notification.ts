interface FeedbackEmailTemplate {
  subject: string;
  html: string;
}

export function getFeedbackNotificationEmailTemplate(
  projectName: string,
  mentorName: string,
  feedback: string
): FeedbackEmailTemplate {
  const subject = `New Feedback Received for ${projectName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .feedback-section {
            background-color: #fff;
            padding: 20px;
            border: 1px solid #e9ecef;
            border-radius: 5px;
          }
          .mentor-name {
            color: #007bff;
            font-weight: bold;
          }
          .project-name {
            font-size: 1.2em;
            font-weight: bold;
            color: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>New Feedback Received</h2>
          <p>You have received new feedback for your project <span class="project-name">${projectName}</span></p>
        </div>
        
        <div class="feedback-section">
          <p>Mentor <span class="mentor-name">${mentorName}</span> has provided the following feedback:</p>
          <blockquote style="border-left: 4px solid #007bff; margin: 0; padding: 10px 20px; background-color: #f8f9fa;">
            ${feedback.replace(/\n/g, '<br>')}
          </blockquote>
        </div>
        
        <p style="margin-top: 20px;">
          Thank you for using MentorMate! If you have any questions about the feedback, 
          please don't hesitate to reach out.
        </p>
      </body>
    </html>
  `;

  return {
    subject,
    html,
  };
}