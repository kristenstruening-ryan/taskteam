import { Router } from "express";
import { getDashboardStats } from "../controllers/projectBoardController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/stats/:boardId", authenticate, getDashboardStats);

export default router;