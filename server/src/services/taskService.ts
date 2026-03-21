import { db } from "../db";
import { tasks } from "../db/schema";
import { eq, and } from "drizzle-orm";

export class TaskService {
  static async createTask(data: { content: string; columnId: string; userId: string }) {
    // 1. Get current count to determine 'order'
    const userTasks = await this.getUserTasks(data.userId);
    const order = userTasks.length;

    const [newTask] = await db
      .insert(tasks)
      .values({
        content: data.content,
        columnId: data.columnId,
        userId: data.userId,
        order: order,
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

  static async moveTask(taskId: string, newColumnId: string, newOrder: number, userId: string) {
    const [updatedTask] = await db
      .update(tasks)
      .set({
        columnId: newColumnId,
        order: newOrder,
      })
      .where(
        and(
          eq(tasks.id, taskId),
          eq(tasks.userId, userId)
        )
      )
      .returning();

    if (!updatedTask) throw new Error("Task not found or unauthorized");
    return updatedTask;
  }
}