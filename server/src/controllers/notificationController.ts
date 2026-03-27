import { Response } from "express";
import { AuthRequest } from "../types";
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
