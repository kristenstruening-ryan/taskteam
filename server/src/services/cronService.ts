import cron from "node-cron";
import { db } from "../db";
import { users, meetings, boardMembers } from "../db/schema";
import { eq, gt, and } from "drizzle-orm";
import { EmailService } from "./emailService";

export const initCronJobs = () => {
  cron.schedule("0 8 * * *", async () => {
    console.log("📡 Initializing Daily Command Briefing...");

    try {
      const digestUsers = await db.query.users.findMany({
        where: eq(users.dailyDigest, true),
        with: {
          boardMemberships: {
            with: {
              board: {
                with: {
                  meetings: {
                    where: gt(meetings.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
                  }
                }
              }
            }
          }
        }
      });

      for (const user of digestUsers) {
        const newMeetings = user.boardMemberships
          .flatMap(membership => membership.board.meetings)
          .map(m => ({
            title: m.title,
            time: m.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            board: "Project Alpha" // You'd ideally grab the board title here
          }));

        if (newMeetings.length > 0 && user.email) {
          await EmailService.sendDailySummary(user.email, newMeetings);
          console.log(`✉️ Briefing dispatched to: ${user.email}`);
        }
      }
    } catch (error) {
      console.error("❌ Cron Job Failure:", error);
    }
  });
};