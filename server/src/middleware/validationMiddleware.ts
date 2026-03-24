import { z } from "zod";

export const createTaskSchema = z.object({
  content: z.string().trim().min(1, "Task content cannot be empty"),
  columnId: z.string().min(1),
  boardId: z.string().uuid(),
});

export const moveTaskSchema = z.object({
  taskId: z.string().uuid(),
  newColumnId: z.string().min(1),
  newOrder: z.number().int().min(0),
});

export const createBoardSchema = z.object({
  title: z.string().trim().min(1, "Board title is required").max(50),
});
