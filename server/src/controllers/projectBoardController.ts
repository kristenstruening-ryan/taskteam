import { Response } from "express";
import { AuthRequest } from "../shared/types";
import { ProjectBoardService } from "../services/projectBoardService";
import { catchAsync } from "../utils/catchAsync";

export const getDashboardStats = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { boardId } = req.params;

    const stats = await ProjectBoardService.getProjectMetrics(boardId);

    res.status(200).json(stats);
  },
);
