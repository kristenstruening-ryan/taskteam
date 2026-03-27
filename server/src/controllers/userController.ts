import { Response } from "express";
import type { AuthRequest } from "../types";
import { UserService } from "../services/userService";
import { catchAsync } from "../utils/catchAsync";

export const updateProfile = catchAsync(async (req: AuthRequest, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const updatedUser = await UserService.updateProfile(req.userId!, name);

  if (!updatedUser) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(updatedUser);
});