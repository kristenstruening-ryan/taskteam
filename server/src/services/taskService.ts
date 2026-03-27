import { db } from "../db";
import { tasks } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class TaskService {
  static async createTask(data: {
    content: string;
    columnId: string;
    userId: string;
    boardId: string;
    description?: string;
    dueDate?: string;
  }) {
    const [newTask] = await db
      .insert(tasks)
      .values({
        content: data.content,
        columnId: data.columnId,
        userId: data.userId,
        boardId: data.boardId,
        description: data.description || "",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
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

  static async updateTask(
    id: string,
    data: Partial<typeof tasks.$inferSelect>,
  ) {
    const [updated] = await db
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();

    return updated;
  }

  static async deleteTask(id: string) {
    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();

    return deleted;
  }
}
