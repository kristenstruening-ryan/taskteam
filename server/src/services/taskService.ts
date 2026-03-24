import { db } from "../db";
import { tasks } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { createTaskSchema } from "../middleware/validationMiddleware";

export class TaskService {
  static async createTask(data: {
    content: string;
    columnId: string;
    userId: string;
    boardId: string;
  }) {
    const validated = createTaskSchema.parse(data);
    const [newTask] = await db
      .insert(tasks)
      .values({
        content: validated.content,
        columnId: validated.columnId,
        userId: data.userId,
        boardId: data.boardId,
        order: 0,
      })
      .returning();

    return newTask;
  }

  static async getUserTasks(userId: string) {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.order);
  }

  static async moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number,
    userId: string,
  ) {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        columnId: newColumnId,
        order: newOrder,
      })
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();

    if (!updatedTask) throw new Error("Task not found or unauthorized");
    return updatedTask;
  }
}
