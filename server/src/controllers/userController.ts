import { Response } from "express";
import type { AuthRequest } from "../shared/types";
import { UserService } from "../services/userService";
import { catchAsync } from "../utils/catchAsync";

export const updateProfile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedUser = await UserService.updateProfile(req.userId!, name);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  }
);

export const updateNotificationSettings = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { emailNotifications, dailyDigest } = req.body;

    const updatedSettings = await UserService.updateNotificationSettings(
      req.userId!,
      { emailNotifications, dailyDigest }
    );

    if (!updatedSettings) {
      return res.status(404).json({ error: "User settings record not found." });
    }

    res.json({
      message: "Comms frequency recalibrated.",
      settings: updatedSettings
    });
  }
);