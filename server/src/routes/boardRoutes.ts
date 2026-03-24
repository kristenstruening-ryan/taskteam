import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import {
  createBoard,
  getBoardData,
  getUserBoards,
} from "../controllers/boardController";

const router = Router();

router.get("/:boardId", authenticate, getBoardData);
router.post("/", authenticate, createBoard);
router.get("/", authenticate, getUserBoards);

export default router;
