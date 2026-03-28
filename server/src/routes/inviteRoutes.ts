import { Router } from "express";
import {
  createInvite,
  acceptBoardInvite,
  verifyToken,
  getPendingRequests,
  processRequest,
  getBoardInvites,
  revokeInvite,
  getAuditLogs,
} from "../controllers/inviteController";
import { authenticate, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// Platform Admin Routes
router.get("/admin/logs", authenticate, isAdmin, getAuditLogs);
router.get("/admin/requests", authenticate, isAdmin, getPendingRequests);
router.patch(
  "/admin/requests/:requestId",

  authenticate,
  isAdmin,
  processRequest,
);

// Board Specific Routes
router.get("/board/:boardId", authenticate, getBoardInvites);
router.post("/board/:boardId", authenticate, createInvite);
router.delete("/board/:boardId/:inviteId", authenticate, revokeInvite);

// Invite Lifecycle
router.get("/verify/:token", verifyToken);
router.post("/accept", authenticate, acceptBoardInvite);

export default router;
