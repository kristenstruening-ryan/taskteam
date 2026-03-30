import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllRead,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/:id/read", authenticate, markAsRead);
router.post("/mark-read", authenticate, markAllRead);

export default router;
