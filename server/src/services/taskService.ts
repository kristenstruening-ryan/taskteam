import { db } from "../db";
import { boardMembers, tasks } from "../db/schema";
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
        ...data,
        description: data.description || "",
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        order: 0,
      })
      .returning();
    return newTask;
  }

  static async getUserTasks(userId: string) {
    return await db
      .select({
        id: tasks.id,
        content: tasks.content,
        columnId: tasks.columnId,
        boardId: tasks.boardId,
        order: tasks.order,
        dueDate: tasks.dueDate,
        description: tasks.description,
        userId: tasks.userId,
      })
      .from(tasks)
      .innerJoin(boardMembers, eq(tasks.boardId, boardMembers.boardId))
      .where(eq(boardMembers.userId, userId))
      .orderBy(tasks.order);
  }

  static async moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number,
    userId: string,
  ) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));

    if (!task.boardId) throw new Error("Task not found");

    const [membership] = await db
      .select()
      .from(boardMembers)
      .where(
        and(
          eq(boardMembers.boardId, task.boardId),
          eq(boardMembers.userId, userId),
        ),
      );

    if (!membership)
      throw new Error("Unauthorized: You are not a member of this board");

    const [updatedTask] = await db
      .update(tasks)
      .set({
        columnId: newColumnId,
        order: newOrder,
      })
      .where(and(eq(tasks.id, taskId)))
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

  static async assignTask(taskId: string, assigneeId: string, userId: string) {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) throw new Error("Task not found");

    if (!task.boardId) {
      throw new Error(
        "Task logic failure: No associated board found for this unit.",
      );
    }

    const [membership] = await db
      .select()
      .from(boardMembers)
      .where(
        and(
          eq(boardMembers.boardId, task.boardId),
          eq(boardMembers.userId, userId),
        ),
      );

    if (!membership) throw new Error("Unauthorized");

    const [updated] = await db
      .update(tasks)
      .set({ assignedTo: assigneeId })
      .where(eq(tasks.id, taskId))
      .returning();

    return updated;
  }
}
