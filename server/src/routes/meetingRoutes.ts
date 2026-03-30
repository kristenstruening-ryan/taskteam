import { Router } from "express";
import * as meetingController from "../controllers/meetingController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.use(authenticate);

router.post("/", meetingController.createMeeting);
router.get("/board/:boardId", meetingController.getBoardMeetings);
router.delete("/:id", meetingController.deleteMeeting);

export default router;