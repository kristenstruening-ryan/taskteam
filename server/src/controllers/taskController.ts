import { Response } from "express";
import { AuthRequest } from "../types";
import { TaskService } from "../services/taskService";

/**
 * GET /api/tasks
 * Fetches all tasks for the authenticated user
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const tasks = await TaskService.getUserTasks(userId);
    res.json(tasks);
  } catch (error) {
    console.error("Error in getTasks controller:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

/**
 * POST /api/tasks
 * Creates a new task for the authenticated user
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { content, columnId } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!content || !columnId) {
      return res
        .status(400)
        .json({ error: "Content and columnId are required" });
    }

    const newTask = await TaskService.createTask({
      content,
      columnId,
      userId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error in createTask controller:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

/**
 * PATCH /api/tasks/move
 * Updates a task's column and its position (order)
 */
export const updateTaskPosition = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, newColumnId, newOrder } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!taskId || !newColumnId || newOrder === undefined) {
      return res
        .status(400)
        .json({ error: "Missing required fields for moving task" });
    }

    const updatedTask = await TaskService.moveTask(
      taskId,
      newColumnId,
      newOrder,
      userId,
    );

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error in updateTaskPosition controller:", error);
    // If TaskService throws "Task not found", we catch it here
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update task position";
    res.status(500).json({ error: errorMessage });
  }
};
