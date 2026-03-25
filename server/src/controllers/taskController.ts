import { Response } from "express";
import { AuthRequest } from "../types";
import { TaskService } from "../services/taskService";
import { createTaskSchema } from "../middleware/validationMiddleware";
import { ZodError } from "zod";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { tasks } from "../db/schema";

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

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const validatedData = createTaskSchema.parse(req.body);

    const newTask = await TaskService.createTask({
      content: validatedData.content,
      columnId: validatedData.columnId,
      boardId: validatedData.boardId,
      userId,
    });

    res.status(201).json(newTask);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Invalid input data",
        details: error.issues,
      });
    }

    console.error("DATABASE_ERROR in createTask:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
};

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
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update task position";
    res.status(500).json({ error: errorMessage });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deleted = await db.delete(tasks).where(eq(tasks.id, id)).returning();

    if (!deleted.length)
      return res.status(404).json({ error: "Task not found" });
    res.json({ message: "task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, content, columnId, assignedTo } = req.body;
    const userId = req.userId;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const updatedTask = await db
      .update(tasks)
      .set({
        description,
        content,
        columnId,
        assignedTo
      })
      .where(eq(tasks.id, id))
      .returning();

    if (!updatedTask.length) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(updatedTask[0]);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
};