import { Router } from "express";
import { EmailController } from "../controllers/emailController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/invite/:id", authenticate, EmailController.inviteMember);

export default router;
