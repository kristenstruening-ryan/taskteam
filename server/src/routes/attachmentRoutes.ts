import { Router } from "express";
import * as attachmentController from "../controllers/attachmentController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get(
  "/presigned",
  authenticate,
  attachmentController.getPresignedUrl,
);

router.post("/", authenticate, attachmentController.saveAttachment);

router.get(
  "/task/:taskId",
  authenticate,
  attachmentController.getTaskAttachments,
);

router.get("/board/:boardId", authenticate, attachmentController.getBoardAttachments);

router.delete("/:id", authenticate, attachmentController.deleteAttachment);

export default router;
