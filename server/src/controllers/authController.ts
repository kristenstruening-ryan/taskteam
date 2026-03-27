import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { db } from "../db";
import { users } from "../db/schema";
import type { AuthRequest } from "../types";
import { catchAsync } from "../utils/catchAsync";

export const signup = catchAsync(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  const existingUser = await AuthService.findUserByEmail(email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await AuthService.hashPassword(password);
  const [newUser] = await db
    .insert(users)
    .values({
      email,
      name,
      password: hashedPassword,
    })
    .returning();

  const token = AuthService.generateToken(newUser.id);
  res.status(201).json({
    token,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await AuthService.findUserByEmail(email);

  if (!user || !(await AuthService.comparePasswords(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = AuthService.generateToken(user.id);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const user = await AuthService.findUserById(req.userId!);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
