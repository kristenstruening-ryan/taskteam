import { Response } from "express";
import { AuthRequest } from "../types";
import { CommentService } from "../services/commentService";
import { NotificationService } from "../services/notificationService";
import { extractMentions } from "../utils/mentionUtils";
import { catchAsync } from "../utils/catchAsync";

export const addComment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { content, boardId, taskId } = req.body;

    if (!boardId) {
      return res.status(400).json({ error: "boardId is required" });
    }

    const newComment = await CommentService.addComment(
      boardId,
      req.userId!,
      content,
      taskId,
    );

    const mentionedEmails = extractMentions(content);
    if (mentionedEmails.length > 0) {
      await NotificationService.createMentionNotifications(
        mentionedEmails,
        req.userId!,
        newComment.id,
      );
    }

    res.status(201).json(newComment);
  },
);

export const getBoardComments = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;
    const data = await CommentService.getCommentsByBoard(boardId);
    res.json(data);
  },
);

export const getTaskComments = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const data = await CommentService.getCommentsByTask(req.params.taskId);
    res.json(data);
  },
);

export const updateComment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const updated = await CommentService.updateComment(
      req.params.commentId,
      req.userId!,
      req.body.content,
    );
    if (!updated)
      return res.status(403).json({ error: "Unauthorized or not found" });
    res.json(updated);
  },
);

export const deleteComment = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const deleted = await CommentService.deleteComment(
      req.params.commentId,
      req.userId!,
    );
    if (!deleted) return res.status(403).json({ error: "Unauthorized" });
    res.json(deleted);
  },
);
