import { Response } from "express";
import { AuthRequest } from "../shared/types";
import { TaskService } from "../services/taskService";
import { createTaskSchema } from "../middleware/validationMiddleware";
import { catchAsync } from "../utils/catchAsync";

export const getTasks = catchAsync(async (req: AuthRequest, res: Response) => {
  const tasks = await TaskService.getUserTasks(req.userId!);
  res.json(tasks);
});

export const createTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const validatedData = createTaskSchema.parse(req.body);

    const newTask = await TaskService.createTask({
      ...validatedData,
      userId: req.userId!,
    });

    res.status(201).json(newTask);
  },
);

export const updateTaskPosition = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { taskId, newColumnId, newOrder } = req.body;

    if (!taskId || !newColumnId || newOrder === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedTask = await TaskService.moveTask(
      taskId,
      newColumnId,
      newOrder,
      req.userId!,
    );

    res.status(200).json(updatedTask);
  },
);

export const updateTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const updatedTask = await TaskService.updateTask(id, req.body);

    if (!updatedTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask);
  },
);

export const deleteTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const deleted = await TaskService.deleteTask(id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  },
);

export const assignTask = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { taskId, assigneeId } = req.body;

    const updatedTask = await TaskService.assignTask(
      taskId,
      assigneeId,
      req.userId!,
    );

    res.json(updatedTask);
  },
);
