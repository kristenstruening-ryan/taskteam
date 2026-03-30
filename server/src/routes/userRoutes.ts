import express from "express";
import { updateProfile, updateNotificationSettings } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.patch("/profile", authenticate, updateProfile);
router.patch("/settings/notifications", authenticate, updateNotificationSettings);

export default router;