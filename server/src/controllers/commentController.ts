import { Response } from "express";
import { AuthRequest } from "../types";
import { db } from "../db";
import { comments, users } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { extractMentions } from "../utils/mentionUtils";
import { createMentionNotifications } from "./notificationController";

export const addComment = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: "User not authenticated" });

  try {
    const [newComment] = await db
      .insert(comments)
      .values({ taskId, userId, content })
      .returning();

    const mentionedEmails = extractMentions(content);
    if (mentionedEmails.length > 0) {
      await createMentionNotifications(mentionedEmails, userId, newComment.id);
    }

    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: "Failed to post comment" });
  }
};

export const getComments = async (req: AuthRequest, res: Response) => {
  const { taskId } = req.params;

  try {
    const data = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        isEdited: comments.isEdited,
        isDeleted: comments.isDeleted,
        user: { email: users.email },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.taskId, taskId))
      .orderBy(comments.createdAt);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch" });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const updatedRows = await db
      .update(comments)
      .set({ content, isEdited: true, updatedAt: new Date() })
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .returning();

    if (updatedRows.length === 0)
      return res.status(403).json({ error: "Unauthorized or not found" });
    res.json(updatedRows[0]);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  const { commentId } = req.params;
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const deletedRows = await db
      .update(comments)
      .set({ content: "This comment was deleted.", isDeleted: true })
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .returning();

    if (deletedRows.length === 0)
      return res.status(403).json({ error: "Unauthorized" });
    res.json(deletedRows[0]);
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};
