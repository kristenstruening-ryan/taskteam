import { Request } from "express";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  userEmail?: string;
  userName?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Task {
  id: string;
  content: string;
  order: number;
  columnId: string;
  userId: string;
}
