import express from "express";
import { updateProfile } from "../controllers/userController";
import { authenticate } from "../middleware/authMiddleware";

const router = express.Router();

router.patch("/profile", authenticate, updateProfile);

export default router;
