import { AuthRequest } from "../types";
import { Response } from "express";
import { db } from "../db";
import { comments, notifications, users } from "../db/schema";
import { and, count, desc, eq, inArray } from "drizzle-orm";

export const createMentionNotifications = async (
  mentionEmails: string[],
  senderId: string,
  commentId: string,
) => {
  if (mentionEmails.length === 0) return;

  const recipients = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.email, mentionEmails));

  if (recipients.length === 0) return;

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
};
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [result] = await db
      .select({ value: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, userId),
          eq(notifications.isRead, false),
        ),
      );

    res.json({ count: Number(result.value) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const data = await db
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

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.id, id), eq(notifications.recipientId, userId!)),
      );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification" });
  }
};
