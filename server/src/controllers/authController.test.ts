import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import { db } from "../db";
import { tasks, users } from "../db/schema";

describe("Auth Controller Integration", () => {
  beforeAll(async () => {
    await db.delete(tasks);
    await db.delete(users);
  });

  it("should return 201 and a token on valid signup", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      email: "kristen@example.com",
      password: "SecurePassword123!",
      name: "Kristen",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.email).toBe("kristen@example.com");
  });

  it("should reject login with an incorrect password", async () => {
    // Signup first
    await request(app).post("/api/auth/signup").send({
      email: "login-test@test.com",
      password: "CorrectPassword123",
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "login-test@test.com",
      password: "WrongPassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });
});
