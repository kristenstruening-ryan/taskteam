import { Router } from "express";
import {
  addComment,
  getTaskComments,
  getBoardComments,
  deleteComment,
  updateComment,
} from "../controllers/commentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/test", (req, res) => res.send("Comment routes are working!"));

router.post("/", authenticate, addComment);

router.get("/board/:boardId", authenticate, getBoardComments);

router.get("/task/:taskId", authenticate, getTaskComments);

router.patch("/:commentId", authenticate, updateComment);

router.delete("/:commentId", authenticate, deleteComment);

export default router;
