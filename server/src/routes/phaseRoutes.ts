import { Router } from "express";
import { PhaseController } from "../controllers/phaseController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.get("/board/:boardId", authenticate, PhaseController.getPhases);

router.post("/", authenticate, PhaseController.createPhase);

router.patch("/:id", authenticate, PhaseController.updatePhase);

router.delete("/:id", authenticate, PhaseController.deletePhase);

router.post("/:id/complete", authenticate, PhaseController.transitionPhase);

export default router;
