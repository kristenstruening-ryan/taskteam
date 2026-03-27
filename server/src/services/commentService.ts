import {
  updateComment,
  deleteComment,
} from "src/controllers/commentController";
import { string } from "zod";
import { db } from "../db";
import { comments, users } from "../db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export class CommentService {
  static async addComment(
    boardId: string,
    userId: string,
    content: string,
    taskId?: string,
  ) {
    const [newComment] = await db
      .insert(comments)
      .values({
        boardId,
        userId,
        content,
        taskId: taskId || null,
      })
      .returning();

    const user = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return {
      ...newComment,
      user: user[0],
    };
  }

  static async getCommentsByTask(taskId: string) {
  const data = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      isEdited: comments.isEdited,
      isDeleted: comments.isDeleted,
      userId: comments.userId,
      userEmail: users.email,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.taskId, taskId))
    .orderBy(desc(comments.createdAt));

  return data.map((row) => ({
    ...row,
    user: row.userEmail ? { email: row.userEmail } : null,
  }));
}

  static async getCommentsByBoard(boardId: string) {
    return await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: { email: users.email, name: users.name },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(and(eq(comments.boardId, boardId), isNull(comments.taskId)))
      .orderBy(comments.createdAt);
  }

  static async updateComment(
    commentId: string,
    userId: string,
    content: string,
  ) {
    const [updated] = await db
      .update(comments)
      .set({ content, isEdited: true, updatedAt: new Date() })
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .returning();
    return updated;
  }

  static async deleteComment(commentId: string, userId: string) {
    const [deleted] = await db
      .update(comments)
      .set({ content: "This comment was deleted.", isDeleted: true })
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .returning();
    return deleted;
  }
}
