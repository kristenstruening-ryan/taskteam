import { db } from "../db";
import { meetings, boardMembers } from "../db/schema";
import { eq, and, asc } from "drizzle-orm";
import { EmailService } from "./emailService";
import { NotificationService } from "./notificationService";
import type { CreateMeetingInput } from "../shared/types";

export const MeetingService = {
  async createMeeting(data: CreateMeetingInput) {
    const membership = await db.query.boardMembers.findFirst({
      where: (bm, { and, eq }) =>
        and(eq(bm.boardId, data.boardId), eq(bm.userId, data.createdById)),
    });

    if (!membership) {
      throw new Error("UNAUTHORIZED_ACCESS: User lacks clearance for this coordinate.");
    }

    const [newMeeting] = await db
      .insert(meetings)
      .values({
        title: data.title,
        boardId: data.boardId,
        startTime: new Date(data.startTime),
        createdById: data.createdById,
        meetingLink: data.meetingLink || "",
        description: data.description || "",
      })
      .returning();

    await NotificationService.createMeetingNotifications(newMeeting, data.createdById);

    const members = await db.query.boardMembers.findMany({
      where: (bm, { eq }) => eq(bm.boardId, data.boardId),
      with: {
        user: {
          columns: { email: true, emailNotifications: true, dailyDigest: true },
        },
      },
    });

    const instantEmailList = members
      .filter((m) => m.user?.emailNotifications && !m.user?.dailyDigest)
      .map((m) => m.user?.email)
      .filter((email): email is string => !!email);

    if (instantEmailList.length > 0) {
      try {
        await EmailService.sendMeetingNotification(instantEmailList, {
          title: newMeeting.title,
          date: newMeeting.startTime.toLocaleString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          link: newMeeting.meetingLink || "Check project board for link",
        });
      } catch (err) {
        console.error("📡 Comms Relay Failure:", err);
      }
    }

    return newMeeting;
  },

  async getBoardMeetings(boardId: string) {
    return await db.query.meetings.findMany({
      where: (m, { eq }) => eq(m.boardId, boardId),
      with: {
        creator: { columns: { name: true, email: true } },
        attachments: true,
      },
      orderBy: [asc(meetings.startTime)],
    });
  },

  async deleteMeeting(meetingId: string, userId: string) {
    const [deleted] = await db
      .delete(meetings)
      .where(and(eq(meetings.id, meetingId), eq(meetings.createdById, userId)))
      .returning();

    if (!deleted) throw new Error("PURGE_FAILED: Record not found.");
    return deleted;
  },
};