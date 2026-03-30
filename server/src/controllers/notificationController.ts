import { Response } from "express";
import { AuthRequest } from "../shared/types";
import { NotificationService } from "../services/notificationService";
import { catchAsync } from "../utils/catchAsync";

export const getUnreadCount = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const count = await NotificationService.getUnreadCount(req.userId!);
    res.json({ count });
  },
);

export const getNotifications = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const data = await NotificationService.getNotifications(req.userId!);
    res.json(data);
  },
);

export const markAsRead = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await NotificationService.markAsRead(id, req.userId!);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "Notification not found or unauthorized" });
    }

    res.json({ success: true });
  },
);

export const markAllRead = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { boardId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await NotificationService.markAllRead(userId, boardId);

    return res.status(200).json({ message: "Notifications cleared" });
  },
);
