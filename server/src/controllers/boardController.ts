import { Response } from "express";
import { AuthRequest } from "../types";
import { createBoardSchema } from "../middleware/validationMiddleware";
import { BoardService } from "../services/boardService";
import { db } from "../db";
import { boards, tasks } from "../db/schema";
import { eq, and } from "drizzle-orm";

export const getBoardData = async (req: AuthRequest, res: Response) => {
  try {
    const { boardId } = req.params;
    const userId = req.userId;

    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
      with: {
        tasks: true,
      },
    });
    if (!board || board.userId !== userId) {
      return res.status(404).json({ error: "Board not found" });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch board data" });
  }
};

export const createBoard = async (req: AuthRequest, res: Response) => {
  const { title } = req.body;
  const userId = req.userId;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!title) return res.status(400).json({ error: "Title is required" });

  try {
    const [newBoard] = await db
      .insert(boards)
      .values({ title, userId })
      .returning();

    res.status(201).json(newBoard);
  } catch (error) {
    res.status(500).json({ error: "Failed to create board" });
  }
};

export const getUserBoards = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID" });
    }

    const userBoards = await db
      .select()
      .from(boards)
      .where(eq(boards.userId, userId));
    res.json(userBoards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch boards" });
  }
};

export const deleteBoard = async (req: AuthRequest, res: Response) => {
  const { boardId } = req.params;
  const userId = req.userId;

  try {
    const deletedRows = await db
      .delete(boards)
      .where(and(eq(boards.id, boardId), eq(boards.userId, userId!)))
      .returning();
    if (deletedRows.length === 0) {
      return res.status(404).json({ error: "Board not found or unauthorized" });
    }
    res.json({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete board" });
  }
};
