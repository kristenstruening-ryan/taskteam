import { Response } from "express";
import { AuthRequest } from "../shared/types";
import { BoardService } from "../services/boardService";
import { catchAsync } from "../utils/catchAsync";
import { signAttachmentUrls } from "../middleware/attachmentMiddleware";

export const getBoardData = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;

    const board = (await BoardService.getBoardById(
      boardId,
      req.userId!,
    )) as any;

    if (!board) return res.status(404).json({ error: "Board not found" });

    const isMember = board.members.some((m: any) => m.userId === req.userId);
    if (!isMember) return res.status(403).json({ error: "Access denied" });

    const tasksWithSignedUrls = await Promise.all(
      board.tasks.map(async (task: any) => ({
        ...task,
        attachments: task.attachments
          ? await signAttachmentUrls(task.attachments)
          : [],
      })),
    );

    res.json({
      ...board,
      tasks: tasksWithSignedUrls,
    });
  },
);

export const createBoard = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { title } = req.body;
    if (!title)
      return res.status(400).json({ error: "Board title is required" });
    const newBoard = await BoardService.createWorkspace(title, req.userId!);
    res.status(201).json(newBoard);
  },
);

export const getUserBoards = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const memberships = await BoardService.getUserBoards(req.userId!);
    res.json(memberships.map((m: any) => m.board));
  },
);

export const deleteBoard = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;
    const deleted = await BoardService.deleteBoard(boardId, req.userId!);
    if (!deleted)
      return res.status(404).json({ error: "Unauthorized or Board not found" });
    res.json({ message: "Board deleted successfully" });
  },
);

export const searchBoards = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const query = req.query.query as string;
    if (!query)
      return res.status(400).json({ error: "Search query is required" });

    const results = await BoardService.searchOrganizations(query);
    res.json(results);
  },
);
