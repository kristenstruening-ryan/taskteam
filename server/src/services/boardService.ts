import { db } from "../db";
import { boards, boardMembers, users , } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const BoardService = {
  async getBoardById(boardId: string) {
    return await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
      with: {
        tasks: {
          with: { comments: true, assignedUser: true },
        },
        members: {
          with: {
            user: {
              columns: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  },

  async createBoard(title: string, userId: string) {
    return await db.transaction(async (tx) => {
      const [newBoard] = await tx
        .insert(boards)
        .values({ title, userId })
        .returning();

      await tx.insert(boardMembers).values({
        boardId: newBoard.id,
        userId,
        role: "owner",
      });

      return newBoard;
    });
  },

  async getUserBoards(userId: string) {
    return await db.query.boardMembers.findMany({
      where: eq(boardMembers.userId, userId),
      with: {
        board: true,
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
