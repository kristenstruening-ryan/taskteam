import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
import { AuthService } from "../services/authService";

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    req.userId = AuthService.verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};