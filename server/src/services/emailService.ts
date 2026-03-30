import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const EmailService = {
  async sendBoardInvite(email: string, boardTitle: string, inviteLink: string) {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ Resend API Key missing. Invitation not sent.");
      return { error: "Configuration Error" };
    }

    return await resend.emails.send({
      from: "TaskTeam <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to ${boardTitle}`,
      html: `
        <div style="background-color: #0f172a; color: #f8fafc; padding: 40px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; border-radius: 16px;">
          <div style="border-left: 4px solid #6366f1; padding-left: 20px;">
            <h1 style="color: #ffffff; letter-spacing: -0.05em; font-size: 24px;">Incoming Invitation</h1>
            <p style="color: #94a3b8; font-size: 16px;">You have been cleared for access to project: <strong style="color: #818cf8;">${boardTitle}</strong></p>

            <div style="margin-top: 30px;">
              <a href="${inviteLink}" style="background-color: #6366f1; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; display: inline-block;">
                Join Mission
              </a>
            </div>
          </div>
          <p style="margin-top: 40px; color: #475569; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em;">
            System ID: TASKTEAM_CMD_CENTER
          </p>
        </div>
      `,
    });
  },

  async sendDailySummary(email: string, meetings: any[]) {
    const meetingListHtml = meetings
      .map(
        (m) => `
          <div style="border-bottom: 1px solid #334155; padding: 10px 0;">
            <p style="margin: 0; color: #ffffff; font-weight: bold;">${m.title}</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">Starts at ${m.time}</p>
          </div>
        `,
      )
      .join("");

    return await resend.emails.send({
      from: "TaskTeam Briefing <updates@resend.dev>",
      to: email,
      subject: `Daily Command Briefing: ${meetings.length} New Events`,
      html: `
        <div style="background-color: #0f172a; color: #f8fafc; padding: 40px; font-family: sans-serif;">
          <h2 style="color: #6366f1;">📅 24-Hour Intel Report</h2>
          <p>The following units have been scheduled on your project boards:</p>
          ${meetingListHtml}
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #6366f1; text-decoration: none; font-weight: bold;">
              → Enter Command Center
            </a>
          </div>
        </div>
      `,
    });
  },

  async sendMeetingNotification(
    emails: string[],
    meetingDetails: { title: string; date: string; link: string },
  ) {
    return await resend.emails.send({
      from: "TaskTeam Updates <onboarding@resend.dev>",
      to: emails,
      subject: `📅 Mission Briefing: ${meetingDetails.title}`,
      html: `
        <div style="background-color: #0f172a; color: #f8fafc; padding: 40px; font-family: 'Segoe UI', sans-serif; border-radius: 16px;">
          <div style="border-left: 4px solid #f59e0b; padding-left: 20px;">
            <h2 style="color: #ffffff; margin-top: 0;">New Meeting Scheduled</h2>
            <p style="color: #94a3b8;">A new briefing has been added to your command board.</p>

            <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #818cf8; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Topic</p>
              <p style="margin: 5px 0 15px 0; font-size: 18px;">${meetingDetails.title}</p>

              <p style="margin: 0; color: #818cf8; font-weight: bold; text-transform: uppercase; font-size: 12px; letter-spacing: 0.1em;">Coordinates (When)</p>
              <p style="margin: 5px 0 0 0;">${meetingDetails.date}</p>
            </div>

            <a href="${meetingDetails.link}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: bold;">
              Access Meeting Link
            </a>
          </div>
        </div>
      `,
    });
  },
};
