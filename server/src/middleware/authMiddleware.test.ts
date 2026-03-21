import { describe, it, expect, vi, beforeEach } from "vitest";
import { authenticate } from "./authMiddleware";
import { AuthRequest } from "../types";
import { Response } from "express";
import * as authUtils from "../utils/authUtils"; // Import the utility to mock it

describe("Auth Middleware", () => {
  // Clear mocks before each test to prevent side effects
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should return 401 if no authorization header is present", () => {
    const req = { headers: {} } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No token provided" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() and attach userId if token is valid", () => {
    const token = "valid-token";
    const userId = "user-123";

    const verifySpy = vi
      .spyOn(authUtils, "verifyToken")
      .mockReturnValue(userId);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as AuthRequest;
    const res = {} as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(verifySpy).toHaveBeenCalledWith(token);
    expect(req.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if token verification fails", () => {
    vi.spyOn(authUtils, "verifyToken").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const req = {
      headers: { authorization: "Bearer bad-token" },
    } as AuthRequest;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid or expired token",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
