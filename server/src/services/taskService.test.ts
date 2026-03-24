import { describe, it, expect, beforeAll } from "vitest";
import { TaskService } from "./taskService";
import { db } from "../db";
import { tasks, users, boards } from "../db/schema"; // Added boards

describe("TaskService", () => {
  const mockUserId = "00000000-0000-0000-0000-000000000001";
  const mockBoardId = "00000000-0000-4000-8000-000000000001";

  beforeAll(async () => {
    await db.delete(tasks);
    await db.delete(boards);
    await db.delete(users);

    await db.insert(users).values({
      id: mockUserId,
      email: "test@example.com",
      password: "hashedpassword",
    });

    await db.insert(boards).values({
      id: mockBoardId,
      title: "Service Test Board",
      userId: mockUserId,
    });
  });

  it("should create a task for a specific user and board", async () => {
    const result = await TaskService.createTask({
      content: "Test Task",
      columnId: "todo",
      userId: mockUserId,
      boardId: mockBoardId,
    });

    expect(result).toHaveProperty("id");
    expect(result.userId).toBe(mockUserId);
    expect(result.boardId).toBe(mockBoardId);
    expect(result.content).toBe("Test Task");
  });
});
