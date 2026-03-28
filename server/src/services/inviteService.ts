import { db } from "../db";
import {
  boardInvites,
  boardMembers,
  boards,
  users,
  notifications,
  platformAccessRequests,
  auditLogs,
} from "../db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import crypto from "crypto";

export class InviteService {
  static async handleInviteLogic(
    boardId: string,
    email: string,
    requesterId: string,
    role: string = "member",
  ) {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await db.insert(boardInvites).values({
        boardId,
        email,
        token,
        role,
        inviterId: requesterId,
        expiresAt,
      });

      return {
        type: "immediate",
        inviteUrl: `${process.env.FRONTEND_URL}/invite?token=${token}`,
      };
    }

    const [existingReq] = await db
      .select()
      .from(platformAccessRequests)
      .where(
        and(
          eq(platformAccessRequests.targetEmail, email),
          eq(platformAccessRequests.status, "pending"),
        ),
      )
      .limit(1);
    if (existingReq)
      throw new Error("A request for this email is already pending.");

    const [newRequest] = await db
      .insert(platformAccessRequests)
      .values({ boardId, requesterId, targetEmail: email, status: "pending" })
      .returning();

    const admins = await db
      .select()
      .from(users)
      .where(eq(users.systemRole, "admin"));
    if (admins.length > 0) {
      await db.insert(notifications).values(
        admins.map((admin) => ({
          recipientId: admin.id,
          senderId: requesterId,
          type: "access_request",
          requestId: newRequest.id,
          content: `Access requested for ${email}`,
        })),
      );
    }
    return { type: "request" };
  }

  static async processInviteToken(
    token: string,
    userId: string,
    userEmail: string,
  ) {
    return await db.transaction(async (tx) => {
      const [invite] = await tx
        .select()
        .from(boardInvites)
        .where(
          and(
            eq(boardInvites.token, token),
            gt(boardInvites.expiresAt, new Date()),
          ),
        )
        .limit(1);
      if (!invite) throw new Error("Invite link is invalid or has expired.");
      if (invite.email !== userEmail)
        throw new Error(
          "This invite was intended for a different email address.",
        );

      await tx
        .insert(boardMembers)
        .values({ boardId: invite.boardId, userId, role: invite.role })
        .onConflictDoNothing();
      await tx.delete(boardInvites).where(eq(boardInvites.id, invite.id));
      return invite.boardId;
    });
  }

  static async getInviteByToken(token: string) {
    const results = await db
      .select({
        id: boardInvites.id,
        boardId: boardInvites.boardId,
        email: boardInvites.email,
        role: boardInvites.role,
        expiresAt: boardInvites.expiresAt,
        boardName: boards.title,
      })
      .from(boardInvites)
      .innerJoin(boards, eq(boardInvites.boardId, boards.id))
      .where(
        and(
          eq(boardInvites.token, token),
          gt(boardInvites.expiresAt, new Date()),
        ),
      )
      .limit(1);
    if (!results[0])
      throw new Error("This invite link is invalid or has expired.");
    return results[0];
  }

  static async getAllPendingRequests() {
    return await db
      .select()
      .from(platformAccessRequests)
      .where(eq(platformAccessRequests.status, "pending"))
      .orderBy(desc(platformAccessRequests.createdAt));
  }

  static async getAuditLogs() {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(50);
  }
  static async approveRequest(requestId: string, adminName: string) {
    return await db.transaction(async (tx) => {
      const [request] = await tx
        .select()
        .from(platformAccessRequests)
        .where(eq(platformAccessRequests.id, requestId))
        .limit(1);
      if (!request || request.status !== "pending")
        throw new Error("Request not found.");

      await tx.insert(auditLogs).values({
        email: request.targetEmail,
        action: "approved",
        adminName: adminName,
      });

      const inviteResult = await this.handleInviteLogic(
        request.boardId!,
        request.targetEmail!,
        request.requesterId!,
        "member",
      );

      // 3. Update request status
      await tx
        .update(platformAccessRequests)
        .set({ status: "approved" })
        .where(eq(platformAccessRequests.id, requestId));

      return inviteResult;
    });
  }

  static async rejectRequest(requestId: string, adminName: string) {
    const [request] = await db
      .select()
      .from(platformAccessRequests)
      .where(eq(platformAccessRequests.id, requestId))
      .limit(1);

    await db.transaction(async (tx) => {
      if (request) {
        await tx.insert(auditLogs).values({
          email: request.targetEmail,
          action: "denied",
          adminName: adminName,
        });
      }
      await tx
        .update(platformAccessRequests)
        .set({ status: "denied" })
        .where(eq(platformAccessRequests.id, requestId));
    });
  }

  static async getInvitesByBoard(boardId: string) {
    return await db
      .select()
      .from(boardInvites)
      .where(eq(boardInvites.boardId, boardId))
      .orderBy(desc(boardInvites.createdAt));
  }

  static async revokeInvite(inviteId: string, boardId: string) {
    return await db
      .delete(boardInvites)
      .where(
        and(eq(boardInvites.id, inviteId), eq(boardInvites.boardId, boardId)),
      );
  }
}
