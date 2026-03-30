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
  systemRole: "admin" | "user";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Board {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  content: string;
  description?: string;
  order: number;
  columnId: string;
  boardId: string;
  userId: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface Meeting {
  id: string;
  boardId: string;
  title: string;
  startTime: Date;
  meetingLink?: string;
  description?: string;
  createdById: string;
  createdAt: Date;
}

export interface Comment {
  id: string;
  boardId: string;
  taskId?: string;
  meetingId?: string;
  userId: string;
  content: string;
  visibility: "public" | "private";
  recipientId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  boardId: string;
  taskId?: string;
  meetingId?: string;
  commentId?: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  createdAt: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: "access_request" | "meeting_reminder" | "mention" | "task_assigned";
  content?: string;
  boardId?: string;
  taskId?: string;
  meetingId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateMeetingInput {
  title: string;
  boardId: string;
  startTime: string;
  createdById: string;
  meetingLink?: string;
  description?: string;
}