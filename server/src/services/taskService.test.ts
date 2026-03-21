import { describe, it, expect, beforeAll } from "vitest";
import { TaskService } from "./taskService";
import { db } from "../db";
import { tasks, users } from "../db/schema";

describe("TaskService", () => {
  const mockUserId = "00000000-0000-0000-0000-000000000001";
  beforeAll(async () => {
    await db.delete(tasks);
    await db.delete(users);
    await db.insert(users).values({
      id: mockUserId,
      email: "test@example.com",
      password: "hashedpassword",
    });
  });

  it("should create a task for a specific user", async () => {
    const result = await TaskService.createTask({
      content: "Test Task",
      columnId: "todo",
      userId: mockUserId,
    });

    expect(result).toHaveProperty("id");
    expect(result.userId).toBe("00000000-0000-0000-0000-000000000001");
  });
});
