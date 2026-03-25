import type { AuthRequest } from "../types";
import { users } from "../db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { Response } from "express";

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { name } = req.body;
  const userId = req.userId;

  try {
    const [updatedUser] = await db
      .update(users)
      .set({ name })
      .where(eq(users.id, userId!))
      .returning({ id: users.id, email: users.email, name: users.name });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
