import { Router } from "express";
import authRoutes from "./authRoutes";
import taskRoutes from "./taskRoutes";
import boardRoutes from "./boardRoutes";
import commentRoutes from "./commentRoutes";
import attachmentRoutes from "./attachmentRoutes";
import notificationRoutes from "./notificationRoutes";
import inviteRoutes from "./inviteRoutes";
import meetingRoutes from "./meetingRoutes";
import emailRoutes from "./emailRoutes";
import userRoutes from "./userRoutes";
import phaseRoutes from './phaseRoutes'
import projectBoardRoutes from './projectBoardRoutes'

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/boards", boardRoutes);
router.use("/comments", commentRoutes);
router.use("/attachments", attachmentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/invites", inviteRoutes);
router.use("/meetings", meetingRoutes);
router.use("/emails", emailRoutes);
router.use('/projectBoard', projectBoardRoutes)
router.use('/phases', phaseRoutes)
router.use("/user", userRoutes);

export default router;
