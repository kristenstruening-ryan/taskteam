import { db } from "../db";
import { boards, tasks } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const BoardService = {
  async createBoard(title: string, userId: string) {
    const [newBoard] = await db
      .insert(boards)
      .values({
        title,
        userId,
      })
      .returning();
    return newBoard;
  },

  async getUserBoards(userId: string) {
    return await db.query.boards.findMany({
      where: eq(boards.userId, userId),
      with: {
        tasks: true, 
      },
    });
  },

  async deleteBoard(boardId: string, userId: string) {
    const [deleted] = await db
      .delete(boards)
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId)))
      .returning();
    return deleted;
  },
};
