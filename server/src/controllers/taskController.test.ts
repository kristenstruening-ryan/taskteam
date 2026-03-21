import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../index";
import { db } from "../db";
import { tasks, users } from "../db/schema";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

describe("Task Controller", () => {
  let token: string;
  const mockUserId = "00000000-0000-0000-0000-000000000001";

  beforeAll(async () => {
    await db.delete(tasks);
    await db.delete(users);

    await db.insert(users).values({
      id: mockUserId,
      email: "controller@example.com",
      password: "hashedpassword",
    });

    token = jwt.sign({ userId: mockUserId }, JWT_SECRET);
  });

  it("should create a new task when authenticated", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        content: "Finish the Drizzle migration",
        columnId: "todo",
      });

    expect(response.status).toBe(201);
    expect(response.body.content).toBe("Finish the Drizzle migration");
    expect(response.body.userId).toBe(mockUserId);
  });
});
