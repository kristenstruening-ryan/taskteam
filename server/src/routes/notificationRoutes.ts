import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../controllers/notificationController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getNotifications);
router.get("/unread-count", authenticate, getUnreadCount);
router.patch("/:id/read", authenticate, markAsRead);

export default router;
