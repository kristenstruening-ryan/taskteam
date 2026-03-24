import { Response } from "express";
import { AuthRequest } from "../types";
import { createBoardSchema } from "../middleware/validationMiddleware";
import { BoardService } from "../services/boardService";
import { db } from "../db";
import { boards, tasks } from "../db/schema";
import { eq } from "drizzle-orm";

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
  try {
    const { title } = createBoardSchema.parse(req.body);
    const userId = req.userId!;

    const board = await BoardService.createBoard(title, userId);
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: "Invalid board data" });
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
