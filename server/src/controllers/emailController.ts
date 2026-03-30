import { Request, Response } from "express";
import { db } from "../db";
import { boards, boardMembers } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { EmailService } from "../services/emailService";
import { catchAsync } from "../utils/catchAsync"; // Import your helper

export const EmailController = {
  inviteMember: catchAsync(async (req: Request, res: Response) => {
    const { id: boardId } = req.params;
    const { email } = req.body;

    const board = await db.query.boards.findFirst({
      where: eq(boards.id, boardId),
    });

    if (!board) {
      return res
        .status(404)
        .json({ message: "Coordinate not found in registry." });
    }

    const existingUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (existingUser) {
      const isMember = await db.query.boardMembers.findFirst({
        where: and(
          eq(boardMembers.boardId, boardId),
          eq(boardMembers.userId, existingUser.id),
        ),
      });
      if (isMember)
        return res.status(400).json({ message: "Unit already has access." });
    }

    const inviteLink = `${process.env.FRONTEND_URL}/invite/${boardId}`;
    const result = await EmailService.sendBoardInvite(
      email,
      board.title,
      inviteLink,
    );

    if (result.error) {
      return res
        .status(500)
        .json({ message: "Comms relay failure.", error: result.error });
    }

    res.status(200).json({ message: "Invitation signal dispatched." });
  }),
};
