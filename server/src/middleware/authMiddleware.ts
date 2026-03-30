import { Response, NextFunction } from "express";
import { AuthRequest } from "../shared/types";
import { AuthService } from "../services/authService";

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = AuthService.verifyToken(token);

    req.userId = decoded.userId;
    req.userRole = decoded.systemRole;
    req.userEmail = decoded.email;
    req.userName = decoded.name;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const isAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  console.log("Checking Admin Status:", {
    uid: req.userId,
    role: req.userRole,
  });

  if (req.userRole !== "admin") {
    return res.status(403).json({
      error: `Forbidden: Required admin, but got ${req.userRole}`,
    });
  }
  next();
};
