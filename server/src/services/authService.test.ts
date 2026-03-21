import { describe, it, expect } from "vitest";
import { AuthService } from "./authService";

describe("AuthService", () => {
  it("should hash a password before saving", async () => {
    const rawPassword = "Password123!";
    const hashedPassword = await AuthService.hashPassword(rawPassword);
    expect(hashedPassword).not.toBe(rawPassword);
    expect(hashedPassword.length).toBeGreaterThan(20);
  });
  it("should generate a valid JWT token for a user", () => {
    const user = { id: "123", email: "test@example.com" };
    const token = AuthService.generateToken(user.id);
    expect(typeof token).toBe("string");
    expect(token.split(".").length).toBe(3);
  });
});
