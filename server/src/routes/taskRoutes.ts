import { Router } from "express";
import {
  createTask,
  updateTaskPosition,
  getTasks,
  deleteTask,
  updateTask,
} from "../controllers/taskController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authenticate, getTasks);
router.post("/", authenticate, createTask);
router.post("/move", authenticate, updateTaskPosition);
router.patch("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;