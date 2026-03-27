import { Router } from "express";
import authRoutes from "./authRoutes";
import taskRoutes from "./taskRoutes";
import boardRoutes from "./boardRoutes";
import commentRoutes from "./commentRoutes";
import notificationRoutes from "./notificationRoutes";
import userRoutes from "./userRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/tasks", taskRoutes);
router.use("/boards", boardRoutes);
router.use("/comments", commentRoutes);
router.use("/notifications", notificationRoutes);
router.use("/user", userRoutes);

export default router;
