import { db } from "../db";
import { boards, boardMembers } from "../db/schema";
import { eq, and, ilike } from "drizzle-orm";

export const BoardService = {
  async getBoardById(boardId: string) {
    return await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
      with: {
        tasks: {
          with: {
            comments: {
              with: { user: { columns: { name: true, email: true } } },
            },
            assignedUser: true,
          },
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

  async createWorkspace(title: string, userId: string) {
    return await db.transaction(async (tx) => {
      const [newBoard] = await tx
        .insert(boards)
        .values({
          title,
          userId,
        })
        .returning();

      await tx.insert(boardMembers).values({
        boardId: newBoard.id,
        userId: userId,
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

  async searchOrganizations(query: string) {
    return await db
      .select({
        id: boards.id,
        title: boards.title,
      })
      .from(boards)
      .where(ilike(boards.title, `%${query}%`))
      .limit(5);
  },
};
