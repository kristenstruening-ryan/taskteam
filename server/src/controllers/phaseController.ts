import { Response } from "express";
import { AuthRequest } from "../shared/types";
import { PhaseService } from "../services/phaseService";
import { catchAsync } from "../utils/catchAsync";

export const PhaseController = {
  getPhases: catchAsync(async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;
    const phases = await PhaseService.getBoardPhases(boardId);
    res.status(200).json(phases);
  }),

  createPhase: catchAsync(async (req: AuthRequest, res: Response) => {
    const { boardId, title, order, dueDate } = req.body;
    const newPhase = await PhaseService.createPhase({ boardId, title, order, dueDate });
    res.status(201).json(newPhase);
  }),

  updatePhase: catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updated = await PhaseService.updatePhase(id, req.body);
    if (!updated) return res.status(404).json({ message: "Phase not found" });
    res.status(200).json(updated);
  }),

  deletePhase: catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    await PhaseService.deletePhase(id);
    res.status(200).json({ message: "Phase decommissioned." });
  }),
  transitionPhase: catchAsync(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { boardId } = req.body;

    const result = await PhaseService.completeAndTransition(id, boardId);
    res.status(200).json(result);
  }),
};
