import { Router } from "express";
import {
  createTask,
  updateTaskPosition,
  getTasks
} from "../controllers/taskController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getTasks);
router.post("/", authenticate, createTask);
router.post("/move", authenticate, updateTaskPosition);

export default router;
