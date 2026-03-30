import { Response, Request } from "express";
import { InviteService } from "../services/inviteService";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../shared/types";

export const createInvite = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;
    const { email, role } = req.body;
    const result = await InviteService.handleInviteLogic(
      boardId,
      email,
      req.userId!,
      role,
    );
    res.status(result.type === "immediate" ? 201 : 202).json(result);
  },
);

export const acceptBoardInvite = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { token } = req.body;
    const boardId = await InviteService.processInviteToken(
      token,
      req.userId!,
      req.userEmail!,
    );
    res.status(200).json({ message: "Joined!", boardId });
  },
);

export const verifyToken = catchAsync(async (req: Request, res: Response) => {
  const invite = await InviteService.getInviteByToken(req.params.token);
  res.status(200).json({ invite });
});

export const getPendingRequests = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const requests = await InviteService.getAllPendingRequests();
    res.status(200).json(requests);
  },
);

export const processRequest = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const adminName = req.userName || "System Admin";

    if (status === "approved") {
      await InviteService.approveRequest(requestId, adminName);
      return res.status(200).json({ message: "Approved" });
    }

    await InviteService.rejectRequest(requestId, adminName);
    res.status(200).json({ message: "Denied" });
  },
);

export const getBoardInvites = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const invites = await InviteService.getInvitesByBoard(req.params.boardId);
    res.status(200).json(invites);
  },
);

export const revokeInvite = catchAsync(
  async (req: AuthRequest, res: Response) => {
    await InviteService.revokeInvite(req.params.inviteId, req.params.boardId);
    res.status(200).json({ message: "Revoked" });
  },
);

export const getAuditLogs = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const logs = await InviteService.getAuditLogs();
    res.status(200).json(logs);
  },
);
