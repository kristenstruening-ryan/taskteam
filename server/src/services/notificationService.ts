import { db } from "../db";
import { notifications, users, comments, boardMembers } from "../db/schema";
import { and, count, desc, eq, inArray } from "drizzle-orm";

export class NotificationService {
  static async createMentionNotifications(
    mentionEmails: string[],
    senderId: string,
    commentId: string,
  ) {
    if (mentionEmails.length === 0) return;

    const recipients = await db
      .select({ id: users.id })
      .from(users)
      .where(inArray(users.email, mentionEmails));

    const notificationData = recipients
      .filter((r) => r.id !== senderId)
      .map((r) => ({
        recipientId: r.id,
        senderId,
        commentId,
        type: "mention" as const,
        isRead: false,
      }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }
  }

  static async getUnreadCount(userId: string) {
    const [result] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.isRead, false),
        ),
      );
    return Number(result.value);
  }

  static async getNotifications(userId: string) {
    return await db
      .select({
        id: notifications.id,
        type: notifications.type,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        senderEmail: users.email,
        commentContent: comments.content,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.senderId, users.id))
      .leftJoin(comments, eq(notifications.commentId, comments.id))
      .where(eq(notifications.recipientId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(10);
  }

  static async markAsRead(notificationId: string, userId: string) {
    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientId, userId),
        ),
      );
  }

  static async markAllRead(userId: string, boardId?: string) {
    const conditions = [eq(notifications.recipientId, userId)];

    if (boardId) {
      conditions.push(eq(notifications.boardId, boardId));
    }

    return await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(...conditions));
  }

  static async notifyAdminsOfRequest(request: any, requesterName: string) {
    const admins = await db
      .select()
      .from(users)
      .where(eq(users.systemRole, "admin"));

    const notificationData = admins.map((admin) => ({
      recipientId: admin.id,
      senderId: request.requesterId,
      type: "access_request",
      requestId: request.id,
      content: `${requesterName} requested platform access for ${request.targetEmail}`,
    }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }
  }
  static async createMeetingNotifications(meeting: any, senderId: string) {
    const members = await db.query.boardMembers.findMany({
      where: eq(boardMembers.boardId, meeting.boardId),
    });

    const notificationData = members
      .filter((m) => m.userId !== senderId)
      .map((m) => ({
        recipientId: m.userId,
        senderId,
        meetingId: meeting.id,
        boardId: meeting.boardId,
        type: "meeting_scheduled",
        content: `New meeting: ${meeting.title}`,
        isRead: false,
      }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }
  }
}
