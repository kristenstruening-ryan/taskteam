import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import { db } from "../db";
import { boards, tasks, users } from "../db/schema";
import jwt from "jsonwebtoken";
import { TaskService } from "../services/taskService";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

describe("Task Controller Integration", () => {
  let token: string;
  const mockUserId = "00000000-0000-0000-0000-000000000001";
  let mockBoardId: string;

  beforeAll(async () => {
    await db.delete(tasks);
    await db.delete(boards);
    await db.delete(users);

    await db.insert(users).values({
      id: mockUserId,
      email: "controller@example.com",
      password: "hashedpassword",
    });

    const [board] = await db
      .insert(boards)
      .values({
        id: "00000000-0000-4000-8000-000000000001",
        title: "Test Board",
        userId: mockUserId,
      })
      .returning();

    mockBoardId = board.id;
    token = jwt.sign({ userId: mockUserId }, JWT_SECRET);
  });

  it("should create a new task when authenticated", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Finish Board Logic",
        columnId: "todo",
        boardId: mockBoardId,
      });

    expect(response.status).toBe(201);
    expect(response.body.boardId).toBe(mockBoardId);
  });
});

describe("Task Security & Validation", () => {
  it("should not allow User A to update User B's task", async () => {
    const userA_Id = "00000000-0000-4000-8000-00000000000a";
    const userB_Id = "00000000-0000-4000-8000-00000000000b";
    const boardB_Id = "00000000-0000-4000-8000-0000000000b2";
    const taskB_Id = "00000000-0000-4000-8000-0000000000bb";

    await db.insert(users).values([
      { id: userA_Id, email: "a@test.com", password: "123" },
      { id: userB_Id, email: "b@test.com", password: "123" },
    ]);

    await db.insert(boards).values({
      id: boardB_Id,
      title: "User B Board",
      userId: userB_Id,
    });

    await db.insert(tasks).values({
      id: taskB_Id,
      content: "Secret Task",
      columnId: "todo",
      boardId: boardB_Id,
      userId: userB_Id,
      order: 0,
    });

    const tokenA = jwt.sign({ userId: userA_Id }, JWT_SECRET);

    const response = await request(app)
      .patch("/api/tasks/move")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        taskId: taskB_Id,
        newColumnId: "done",
        newOrder: 0,
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toMatch(/unauthorized|not found/i);
  });

  it("should throw a validation error if task content is empty", async () => {
    const userId = "00000000-0000-0000-0000-000000000001";
    const boardId = "00000000-0000-0000-0000-0000000000B1";

    await expect(
      TaskService.createTask({
        content: "",
        columnId: "todo",
        boardId: boardId,
        userId: userId,
      }),
    ).rejects.toThrow();
  });
});
