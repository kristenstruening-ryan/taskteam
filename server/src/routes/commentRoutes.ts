import { Router } from "express";
import {
  addComment,
  getComments,
  deleteComment,
  updateComment,
} from "../controllers/commentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/:taskId", authenticate, addComment);

router.get("/:taskId", authenticate, getComments);

router.patch("/:commentId", authenticate, updateComment);

router.delete("/:commentId", authenticate, deleteComment);

export default router;
